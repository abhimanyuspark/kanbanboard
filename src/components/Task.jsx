import { useState } from "react";
import { FaEdit, FaTrash } from "../icons/icons";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PropTypes from 'prop-types';

const Task = ({ task, deleteTask, updateTask }) => {
    const [mouseIsOver, setMouseIsOver] = useState(false);
    const [editMode, setEditMode] = useState(true);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        },
        disabled: editMode,
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    const toggleEditMode = () => {
        setEditMode((prev) => !prev);
        setMouseIsOver(false);
    };

    if (isDragging) {
        return (
            <div
                ref={ setNodeRef }
                style={ style }
                className="opacity-30 bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl border-2 border-rose-500  cursor-grab relative"
            />
        );
    }

    if (editMode) {
        return (
            <div
                ref={ setNodeRef }
                style={ style }
                { ...attributes }
                { ...listeners }
                className="bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative"
            >
                <textarea
                    className="h-[90%] w-full resize-none border-none rounded bg-transparent text-white focus:outline-none"
                    value={ task.content }
                    autoFocus
                    placeholder="Task content here"
                    onBlur={ toggleEditMode }
                    onKeyDown={ (e) => {
                        if (e.key === "Enter" && e.shiftKey) {
                            toggleEditMode();
                        }
                    } }
                    onChange={ (e) => updateTask(task.id, e.target.value) }
                />
            </div>
        );
    }

    return (
        <div
            ref={ setNodeRef }
            style={ style }
            { ...attributes }
            { ...listeners }
            className="bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-rose-500 cursor-grab relative task"
            onMouseEnter={ () => {
                setMouseIsOver(true);
            } }
            onMouseLeave={ () => {
                setMouseIsOver(false);
            } }
        >
            <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
                { task.content }
            </p>

            { mouseIsOver && (
                <div className="flex gap-2 absolute top-1/3 right-2 bg-columnBackgroundColor">
                    <button
                        onClick={ () => {
                            deleteTask(task.id);
                        } }
                        className="stroke-white p-2 rounded opacity-60 hover:opacity-100"
                    >
                        <FaTrash />
                    </button>
                    <button
                        onClick={ toggleEditMode }
                        className="stroke-white p-2 rounded opacity-60 hover:opacity-100"
                    >
                        <FaEdit />
                    </button>
                </div>
            ) }
        </div>
    );
}

Task.propTypes = {
    task: PropTypes.object.isRequired,
    deleteTask: PropTypes.func.isRequired,
    updateTask: PropTypes.func.isRequired,
};

export default Task;
