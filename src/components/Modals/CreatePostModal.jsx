/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useState, useEffect, useCallback } from "react"; // Added useCallback
import { createPortal } from "react-dom";
import { jwtDecode } from "jwt-decode";

import ComposeStep from "../Modals/Create Post Components/ComposeStep";
import CaptionsStep from "../Modals/Create Post Components/CaptionsSteps";
import DraftPromptModal from "../Modals/DraftModal";
import IngredientPromptModal from "../Modals/IngredientsPromptModal";
import useDraft from "../Modals/Draft";

const STEP_COMPOSE = "compose";
const STEP_CAPTIONS = "captions";

export default function CreatePostModal({ isOpen, onClose, onPost }) {
  const [step, setStep] = useState(STEP_COMPOSE);
  const [title, setTitle] = useState("");
  const [postText, setPostText] = useState("");
  const [mediaItems, setMediaItems] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [skipIngredientPrompt, setSkipIngredientPrompt] = useState(false);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [showIngredientPrompt, setShowIngredientPrompt] = useState(false);
  const [userName, setUserName] = useState("");
  const fileInputRef = useRef(null);

  const { saveDraft, loadDraft, clearDraft } = useDraft();

  const hasMultiple = mediaItems.length > 1;
  const captionedCount = mediaItems.filter((m) => m.title || m.caption).length;

  // ingredients.length > 0 now counts as "has content" → triggers draft prompt
  const hasContent = !!(
    title.trim() ||
    postText.trim() ||
    mediaItems.length > 0 ||
    ingredients.length > 0
  );
  const isPostEmpty = !postText.trim() && mediaItems.length === 0;

  useEffect(() => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) setUserName(jwtDecode(token).username);
    } catch {}
  }, []);

  const hardClose = useCallback(() => {
    setStep(STEP_COMPOSE);
    setShowDraftPrompt(false);
    setShowIngredientPrompt(false);
    onClose();
  }, [onClose]);

  const attemptClose = useCallback(() => {
    if (hasContent) setShowDraftPrompt(true);
    else hardClose();
  }, [hasContent, hardClose]);

  // Load draft when modal opens. `loadDraft` comes from a local hook
  // and is recreated each render, so call it directly and avoid
  // listing it in deps to prevent effect from re-running repeatedly.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isOpen) return;
    const draft = loadDraft();
    if (draft) {
      setTitle(draft.title ?? "");
      setPostText(draft.postText ?? "");
      setMediaItems(Array.isArray(draft.mediaItems) ? draft.mediaItems : []);
      setIngredients(Array.isArray(draft.ingredients) ? draft.ingredients : []);
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") attemptClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, hasContent, attemptClose]);

  if (!isOpen) return null;

  const handleSaveDraft = () => {
    saveDraft({ title, postText, mediaItems, ingredients }); // ingredients persisted in draft
    setTitle("");
    setPostText("");
    setMediaItems([]);
    setIngredients([]);
    hardClose();
  };

  const handleDiscard = () => {
    clearDraft();
    setTitle("");
    setPostText("");
    setMediaItems([]);
    setIngredients([]);
    hardClose();
  };

  const handlePost = async () => {
    if (isPostEmpty) return;
    if (ingredients.length === 0 && !skipIngredientPrompt) {
      setShowIngredientPrompt(true);
      return;
    }
    await submitPost();
  };

  const submitPost = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("User is not authenticated. Please log in again.");
      return;
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (error) {
      console.error("Invalid token:", error);
      alert("Invalid token. Please log in again.");
      return;
    }

    if (!decoded.userId && !decoded.id) {
      alert("User ID is missing. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("caption", postText);
    formData.append("userId", decoded.userId || decoded.id);
    formData.append("ingredients", JSON.stringify(ingredients));
    mediaItems.forEach((item) => {
      if (item.file) formData.append("media", item.file);
    });

    console.log("Decoded token:", decoded);
    console.log("Request payload:", {
      title,
      caption: postText,
      userId: decoded.userId || decoded.id,
      ingredients,
      mediaItems,
    });

    const response = await fetch("http://localhost:3000/api/posts", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to create post");

    if (typeof onPost === "function") onPost({ ...data, ingredients });

    clearDraft();
    setTitle("");
    setPostText("");
    setMediaItems([]);
    setIngredients([]);
    setStep(STEP_COMPOSE);
    onClose();
  };

  const handleIngredientPromptAdd = () => setShowIngredientPrompt(false);
  const handleIngredientPromptProceed = () => {
    setShowIngredientPrompt(false);
    submitPost();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setMediaItems((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video") ? "video" : "image",
        title: "",
        caption: "",
      })),
    ]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveMedia = (id) => {
    setMediaItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.file) URL.revokeObjectURL(item.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const sharedProps = {
    isPostEmpty,
    onAttemptClose: attemptClose,
    onPost: handlePost,
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={attemptClose}
      >
        {step === STEP_COMPOSE && (
          <ComposeStep
            {...sharedProps}
            userName={userName}
            title={title}
            setTitle={setTitle}
            postText={postText}
            setPostText={setPostText}
            mediaItems={mediaItems}
            hasMultiple={hasMultiple}
            captionedCount={captionedCount}
            onEditCaptions={() => setStep(STEP_CAPTIONS)}
            onAddMedia={() => fileInputRef.current?.click()}
            onRemoveMedia={handleRemoveMedia}
            fileInputRef={fileInputRef}
            onFileChange={handleFileChange}
            ingredients={ingredients}
            setIngredients={setIngredients}
            skipIngredientPrompt={skipIngredientPrompt}
            setSkipIngredientPrompt={setSkipIngredientPrompt}
          />
        )}

        {step === STEP_CAPTIONS && (
          <CaptionsStep
            {...sharedProps}
            mediaItems={mediaItems}
            onBack={() => setStep(STEP_COMPOSE)}
            onCaptionsChange={setMediaItems}
          />
        )}
      </div>

      {showDraftPrompt && (
        <DraftPromptModal
          onSaveDraft={handleSaveDraft}
          onDiscard={handleDiscard}
          onDismiss={() => setShowDraftPrompt(false)}
        />
      )}

      {showIngredientPrompt && (
        <IngredientPromptModal
          onAddIngredients={handleIngredientPromptAdd}
          onProceed={handleIngredientPromptProceed}
          onDismiss={() => setShowIngredientPrompt(false)}
        />
      )}
    </>,
    document.body,
  );
}
