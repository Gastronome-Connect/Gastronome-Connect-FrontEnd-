import { FaEdit, FaTrash, FaArchive, FaFlag } from "react-icons/fa";

export const OwnerMenu = ({ onEdit, onDelete }) => (
  <>
    <button
      onClick={onEdit}
      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-[#F57600] transition-colors"
    >
      <FaEdit size={14} /> Edit Post
    </button>
    <div className="border-t border-gray-100" />
    <button
      onClick={onDelete}
      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
    >
      <FaTrash size={14} /> Delete Post
    </button>
  </>
);

export const ViewerMenu = ({ onArchive, onReport }) => (
  <>
    <button
      onClick={onArchive}
      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-[#F57600] transition-colors"
    >
      <FaArchive size={14} /> Archive Recipe
    </button>
    <div className="border-t border-gray-100" />
    <button
      onClick={onReport}
      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-[#F57600] transition-colors"
    >
      <FaFlag size={14} /> Report Post
    </button>
  </>
);

/**
 * PostMenu no longer handles its own outside-click — the parent wraps both
 * the trigger button and this dropdown in a single ref so clicking the button
 * cleanly toggles without the outside-click handler fighting it.
 */
const PostMenu = ({ isOwner = false, onEdit, onDelete, onArchive, onReport }) => (
  <div className="absolute right-0 top-10 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden w-48">
    {isOwner ? (
      <OwnerMenu onEdit={onEdit} onDelete={onDelete} />
    ) : (
      <ViewerMenu onArchive={onArchive} onReport={onReport} />
    )}
  </div>
);

export default PostMenu;