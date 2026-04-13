import { useState } from "react";
import { UtensilsCrossed, ChevronDown, ChevronUp, ShieldAlert, Heart } from "lucide-react";
import MediaGrid from "./MediaGrid";
import InfoPill from "../../../components/Pages/Panels/Pills";

const TITLE_MAX     = 60;
const CAPTION_LIMIT = 200;

/* ── Safe ingredients parser ── */
const parseIngredients = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; }
    catch { return []; }
  }
  return [];
};

const formatMeasure = (ing) => {
  if (!ing.amount && !ing.unit) return null;
  if (ing.unit === "to taste") return "to taste";
  return [ing.amount, ing.unit].filter(Boolean).join(" ");
};

/* ── Ingredient list ── */
const IngredientList = ({ ingredients }) => {
  const [expanded, setExpanded] = useState(false);
  const safe = parseIngredients(ingredients);
  if (safe.length === 0) return null;

  const PREVIEW_COUNT = 4;
  const showToggle    = safe.length > PREVIEW_COUNT;
  const visible       = expanded ? safe : safe.slice(0, PREVIEW_COUNT);

  return (
    <div className="mb-3 rounded-2xl border border-orange-100 bg-orange-50/60 px-3.5 py-3">
      <div className="flex items-center gap-1.5 mb-2">
        <UtensilsCrossed size={13} className="text-[#F57600]" />
        <span className="text-xs font-extrabold text-[#F57600] uppercase tracking-wide">
          Ingredients
        </span>
        <span className="ml-auto text-[10px] text-orange-400 font-medium">
          {safe.length} item{safe.length !== 1 ? "s" : ""}
        </span>
      </div>

      <ul className="space-y-1">
        {visible.map((ing, i) => {
          const measure = formatMeasure(ing);
          return (
            <li key={ing.id ?? i} className="flex items-baseline gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F57600] shrink-0 mt-1.5" />

              {measure && (
                <span className="text-[11px] font-bold text-[#F57600] shrink-0 min-w-[52px]">
                  {measure}
                </span>
              )}

              <span className="text-sm text-gray-700 leading-snug capitalize flex-1">
                {ing.name}
              </span>

              {/* ── Optional badge — only shown when ingredient.optional is true ── */}
              {ing.optional && (
                <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-500 border border-amber-200 leading-none">
                  optional
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {showToggle && (
        <button
          onClick={() => setExpanded((p) => !p)}
          className="mt-2 flex items-center gap-1 text-[#F57600] text-xs font-bold hover:underline transition-all"
        >
          {expanded
            ? <><ChevronUp size={12} /> Show less</>
            : <><ChevronDown size={12} /> +{safe.length - PREVIEW_COUNT} more</>}
        </button>
      )}
    </div>
  );
};

/* ── Viewer profile tags row ── */
const UserTagsRow = ({ allergens = [], dislikes = [], flavors = [], cookingStyles = [] }) => {
  const hasAllergenTags  = allergens.length > 0 || dislikes.length > 0;
  const hasPreferenceTags = flavors.length > 0 || cookingStyles.length > 0;
  if (!hasAllergenTags && !hasPreferenceTags) return null;

  return (
    <div className="mb-3 rounded-2xl border border-gray-100 bg-gray-50/70 px-3.5 py-3">
      <div className="flex items-center gap-2 mb-2.5">
        {hasAllergenTags
          ? <ShieldAlert size={13} className="text-red-400" />
          : <Heart       size={13} className="text-indigo-400" />
        }
        <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">
          Your profile tags
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {hasAllergenTags && (
          <div className="flex flex-wrap gap-1.5">
            {allergens.map((t) => <InfoPill key={t} text={t} variant="allergen" />)}
            {dislikes.map((t)  => <InfoPill key={t} text={t} variant="dislike"  />)}
          </div>
        )}
        {hasPreferenceTags && (
          <div className="flex flex-wrap gap-1.5">
            {flavors.map((t)       => <InfoPill key={t} text={t} variant="flavor"  />)}
            {cookingStyles.map((t) => <InfoPill key={t} text={t} variant="cooking" />)}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── PostContent ── */
const PostContent = ({ post, onExpand, viewerProfile = null }) => {
  const [captionExpanded, setCaptionExpanded] = useState(false);

  const firstWithContent = post.mediaItems?.find((m) => m.title || m.caption);
  const displayTitle     = firstWithContent?.title   ?? post.title   ?? "";
  const displayCaption   = firstWithContent?.caption ?? post.caption ?? "";

  const isLong       = displayCaption.length > CAPTION_LIMIT;
  const shownCaption =
    isLong && !captionExpanded
      ? displayCaption.slice(0, CAPTION_LIMIT) + "..."
      : displayCaption;

  return (
    <div>
      {/* 1. Title */}
      {displayTitle && (
        <h2 className="text-xl font-extrabold text-gray-900 mb-2 leading-snug">
          {displayTitle.slice(0, TITLE_MAX)}
        </h2>
      )}

      {/* 2. Ingredients — each item shows "optional" badge if ing.optional is true */}
      <IngredientList ingredients={post.ingredients} />

      {/* 3. Viewer profile tags */}
      {viewerProfile && (
        <UserTagsRow
          allergens={viewerProfile.allergens}
          dislikes={viewerProfile.dislikes}
          flavors={viewerProfile.flavors}
          cookingStyles={viewerProfile.cookingStyles}
        />
      )}

      {/* 4. Caption */}
      {displayCaption && (
        <div className="mb-3">
          <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-wrap">
            {shownCaption}
          </p>
          {isLong && (
            <button
              onClick={() => setCaptionExpanded((p) => !p)}
              className="text-[#F57600] text-xs font-bold mt-1 hover:underline transition-all"
            >
              {captionExpanded ? "See less" : "See more"}
            </button>
          )}
        </div>
      )}

      {/* 5. Media */}
      {(post.mediaItems?.length ?? 0) > 0 && (
        <div className="pb-3">
          <MediaGrid mediaItems={post.mediaItems} onExpand={onExpand} />
        </div>
      )}
    </div>
  );
};

export default PostContent;