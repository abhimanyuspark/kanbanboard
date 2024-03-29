import { FaPlus } from "../icons/icons";
import { useMemo, useState } from "react";
import Column from "./Column";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import Task from "./Task";
import { status, users } from "../data/data.json";
import { generateId } from "../utilities/generateId"

const KanBanBoard = () => {
    const [columns, setColumns] = useState(status);
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

    const [tasks, setTasks] = useState(users);

    const [activeColumn, setActiveColumn] = useState(null);

    const [activeTask, setActiveTask] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );

    return (
        <div
            className="m-auto flex min-h-screen w-full items-center overflow-x-auto overflow-y-hidden px-[40px] select-none"
        >
            <DndContext
                sensors={ sensors }
                onDragStart={ onDragStart }
                onDragEnd={ onDragEnd }
                onDragOver={ onDragOver }
            >
                <div className="m-auto flex gap-4">
                    <div className="flex gap-4">
                        <SortableContext items={ columnsId }>
                            { columns.map((col) => (
                                <Column
                                    key={ col.id }
                                    column={ col }
                                    deleteColumn={ deleteColumn }
                                    updateColumn={ updateColumn }
                                    createTask={ createTask }
                                    deleteTask={ deleteTask }
                                    updateTask={ updateTask }
                                    tasks={ tasks.filter((task) => task.statusId === col.id) }
                                />
                            )) }
                        </SortableContext>
                    </div>
                    <button
                        onClick={ () => {
                            createNewColumn();
                        } }
                        className="Dh-[60px] w-[350px] min-w-[350px] cursor-pointer rounded-lg bg-mainBackgroundColor border-2 border-columnBackgroundColor p-4 ring-rose-500 hover:ring-2 flex gap-2"
                    >
                        <FaPlus />
                        Add Column
                    </button>
                </div>

                { createPortal(
                    <DragOverlay>
                        { activeColumn && (
                            <Column
                                column={ activeColumn }
                                deleteColumn={ deleteColumn }
                                updateColumn={ updateColumn }
                                createTask={ createTask }
                                deleteTask={ deleteTask }
                                updateTask={ updateTask }
                                tasks={ tasks.filter(
                                    (task) => task.statusId === activeColumn.id
                                ) }
                            />
                        ) }
                        { activeTask && (
                            <Task
                                task={ activeTask }
                                deleteTask={ deleteTask }
                                updateTask={ updateTask }
                            />
                        ) }
                    </DragOverlay>,
                    document.body
                ) }
            </DndContext>
        </div>
    );

    // * CRUD operations for tasks * //

    function createTask(statusId) {
        const newTask = {
            id: generateId(),
            statusId,
            content: `Task ${tasks.length + 1}`,
        };

        setTasks([...tasks, newTask]);
    }

    function deleteTask(id) {
        const newTasks = tasks.filter((task) => task.id !== id);
        setTasks(newTasks);
    }

    function updateTask(id, content) {
        const newTasks = tasks.map((task) => {
            if (task.id !== id) return task;
            return { ...task, content };
        });

        setTasks(newTasks);
    }

    // * CRUD operations for columns * //

    function createNewColumn() {
        const columnToAdd = {
            id: generateId(),
            title: `Column ${columns.length + 1}`,
        };

        setColumns([...columns, columnToAdd]);
    }

    function deleteColumn(id) {
        const filteredColumns = columns.filter((col) => col.id !== id);
        setColumns(filteredColumns);

        const newTasks = tasks.filter((t) => t.statusId !== id);
        setTasks(newTasks);
    }

    function updateColumn(id, title) {
        const newColumns = columns.map((col) => {
            if (col.id !== id) return col;
            return { ...col, title };
        });

        setColumns(newColumns);
    }

    // * Drag Functions * //

    function onDragStart(event) {
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.column);
            return;
        }

        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
            return;
        }
    }

    function onDragEnd(event) {
        setActiveColumn(null);
        setActiveTask(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveAColumn = active.data.current?.type === "Column";
        if (!isActiveAColumn) return;

        console.log("DRAG END");

        setColumns((columns) => {
            const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

            const overColumnIndex = columns.findIndex((col) => col.id === overId);

            return arrayMove(columns, activeColumnIndex, overColumnIndex);
        });
    }

    function onDragOver(event) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveATask = active.data.current?.type === "Task";
        const isOverATask = over.data.current?.type === "Task";

        if (!isActiveATask) return;

        // Im dropping a Task over another Task
        if (isActiveATask && isOverATask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const overIndex = tasks.findIndex((t) => t.id === overId);

                if (tasks[activeIndex].statusId != tasks[overIndex].statusId) {
                    // Fix introduced after video recording
                    tasks[activeIndex].statusId = tasks[overIndex].statusId;
                    return arrayMove(tasks, activeIndex, overIndex - 1);
                }

                return arrayMove(tasks, activeIndex, overIndex);
            });
        }

        const isOverAColumn = over.data.current?.type === "Column";

        // Im dropping a Task over a column
        if (isActiveATask && isOverAColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);

                tasks[activeIndex].statusId = overId;
                console.log("DROPPING TASK OVER COLUMN", { activeIndex });
                return arrayMove(tasks, activeIndex, activeIndex);
            });
        }
    }
}

export default KanBanBoard;
