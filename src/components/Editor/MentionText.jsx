import { renderMentionParts } from "../../utils/mentions";

const MentionText = ({ text = "", mentions = [], className = "" }) => {
  const parts = renderMentionParts(text, mentions);

  return (
    <p className={className}>
      {parts.map((part, index) =>
        part.type === "mention" ? (
          <span
            key={`${part.value}-${index}`}
            className="font-semibold text-[#F57600] bg-orange-50 rounded-md px-0.5"
          >
            {part.value}
          </span>
        ) : (
          <span key={`${part.value}-${index}`}>{part.value}</span>
        ),
      )}
    </p>
  );
};

export default MentionText;
