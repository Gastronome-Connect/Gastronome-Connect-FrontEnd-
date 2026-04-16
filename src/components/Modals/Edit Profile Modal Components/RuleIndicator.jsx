const RuleIndicator = ({ met, label }) => (
  <div className={`flex items-center gap-1.5 text-xs ${met ? "text-green-500" : "text-gray-400"}`}>
    <div className={`w-1.5 h-1.5 rounded-full ${met ? "bg-green-500" : "bg-gray-300"}`} />
    {label}
  </div>
);

export default RuleIndicator;