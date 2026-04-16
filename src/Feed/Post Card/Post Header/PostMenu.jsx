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

export const ViewerMenu = ({ onArchive, onReport, isArchived }) => (
  <>
    <button
      onClick={onArchive}
      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-[#F57600] transition-colors"
    >
      <FaArchive size={14} className={isArchived ? "text-[#F57600]" : ""} />
      {isArchived ? "Unarchive Recipe" : "Archive Recipe"}
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
 * PostMenu
 * Now accepts `post` so ViewerMenu can show archive toggle state.
 */
const PostMenu = ({ isOwner = false, post, onEdit, onDelete, onArchive, onReport, isArchived = false }) => (
  <div className="absolute right-0 top-10 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden w-48">
    {isOwner ? (
      <OwnerMenu onEdit={onEdit} onDelete={onDelete} />
    ) : (
      <ViewerMenu onArchive={onArchive} onReport={onReport} isArchived={isArchived} />
    )}
  </div>
);

export default PostMenu;