import TagEditor from "../../Modals/Edit Profile Modal Components/TagsEditor";

const AllergensTab = ({
  allergens,
  setAllergens,
  dislikes,
  setDislikes,
  allergenOptions,
  dislikeOptions,
  optionsLoading,
}) => (
  <div className="flex flex-col gap-6">
    <TagEditor
      label="Allergens"
      items={allergens}
      onAdd={(v) => setAllergens([...allergens, v])}
      onRemove={(v) => setAllergens(allergens.filter((a) => a !== v))}
      placeholder="Add an allergen..."
      availableOptions={allergenOptions}
      loading={optionsLoading}
    />
    <TagEditor
      label="Dislikes"
      items={dislikes}
      onAdd={(v) => setDislikes([...dislikes, v])}
      onRemove={(v) => setDislikes(dislikes.filter((d) => d !== v))}
      placeholder="Add a dislike..."
      availableOptions={dislikeOptions}
      loading={optionsLoading}
    />
  </div>
);

export default AllergensTab;
