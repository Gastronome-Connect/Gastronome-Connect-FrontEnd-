import TagEditor from "../Edit Profile Modal Components/TagsEditor";

const PreferencesTab = ({ flavors, setFlavors, cookingStyles, setCookingStyles }) => (
  <div className="flex flex-col gap-6">
    <TagEditor
      label="Flavors"
      items={flavors}
      onAdd={(v) => setFlavors([...flavors, v])}
      onRemove={(v) => setFlavors(flavors.filter((f) => f !== v))}
      placeholder="Add a flavor..."
    />
    <TagEditor
      label="Cooking Style"
      items={cookingStyles}
      onAdd={(v) => setCookingStyles([...cookingStyles, v])}
      onRemove={(v) => setCookingStyles(cookingStyles.filter((c) => c !== v))}
      placeholder="Add a cooking style..."
    />
  </div>
);

export default PreferencesTab;