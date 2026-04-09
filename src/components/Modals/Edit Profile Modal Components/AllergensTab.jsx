import TagEditor from "../../Modals/Edit Profile Modal Components/TagsEditor";

const AllergensTab = ({ allergens, setAllergens, dislikes, setDislikes }) => (
  <div className="flex flex-col gap-6">
    <TagEditor
      label="Allergens"
      items={allergens}
      onAdd={(v) => setAllergens([...allergens, v])}
      onRemove={(v) => setAllergens(allergens.filter((a) => a !== v))}
      placeholder="Add an allergen..."
    />
    <TagEditor
      label="Dislikes"
      items={dislikes}
      onAdd={(v) => setDislikes([...dislikes, v])}
      onRemove={(v) => setDislikes(dislikes.filter((d) => d !== v))}
      placeholder="Add a dislike..."
    />
  </div>
);

export default AllergensTab;