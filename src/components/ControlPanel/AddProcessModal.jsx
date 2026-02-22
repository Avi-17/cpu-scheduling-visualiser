import React, { useState } from 'react';
import { Process } from '../../scheduler/Process';

const ALGORITHMS_NEEDING_PRIORITY = ['priority', 'priority-np', 'priority-p', 'mlfq'];

function AddProcessModal({ isOpen, onClose, onSubmit, currentAlgorithm }) {
    const [rows, setRows] = useState([createEmptyRow()]);
    const [errors, setErrors] = useState({});

    const showPriority = ALGORITHMS_NEEDING_PRIORITY.includes(currentAlgorithm);

    function createEmptyRow() {
        return { arrivalTime: '', burstTime: '', priority: '' };
    }

    function handleChange(index, field, value) {
        const updated = [...rows];
        updated[index] = { ...updated[index], [field]: value };
        setRows(updated);

        // Clear error for this field
        const errKey = `${index}-${field}`;
        if (errors[errKey]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[errKey];
                return next;
            });
        }
    }

    function addRow() {
        setRows(prev => [...prev, createEmptyRow()]);
    }

    function removeRow(index) {
        if (rows.length <= 1) return;
        setRows(prev => prev.filter((_, i) => i !== index));
    }

    function validate() {
        const newErrors = {};
        let valid = true;

        rows.forEach((row, i) => {
            const arrival = Number(row.arrivalTime);
            const burst = Number(row.burstTime);
            const priority = Number(row.priority);

            if (row.arrivalTime === '' || isNaN(arrival) || arrival < 0) {
                newErrors[`${i}-arrivalTime`] = 'Must be ≥ 0';
                valid = false;
            }
            if (row.burstTime === '' || isNaN(burst) || burst <= 0) {
                newErrors[`${i}-burstTime`] = 'Must be > 0';
                valid = false;
            }
            if (showPriority && (row.priority === '' || isNaN(priority) || priority < 0)) {
                newErrors[`${i}-priority`] = 'Must be ≥ 0';
                valid = false;
            }
        });

        setErrors(newErrors);
        return valid;
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!validate()) return;

        const processes = rows.map(row => new Process({
            arrivalTime: Number(row.arrivalTime),
            burstTime: Number(row.burstTime),
            priority: showPriority ? Number(row.priority) : Math.floor(Math.random() * 10) + 1
        }));

        onSubmit(processes);
        setRows([createEmptyRow()]);
        setErrors({});
        onClose();
    }

    function handleClose() {
        setRows([createEmptyRow()]);
        setErrors({});
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Add Processes</h3>
                    <button className="modal-close-btn" onClick={handleClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="modal-table-header">
                        <span className="modal-col">#</span>
                        <span className="modal-col">Arrival Time</span>
                        <span className="modal-col">Burst Time</span>
                        {showPriority && <span className="modal-col">Priority</span>}
                        <span className="modal-col modal-col-action"></span>
                    </div>

                    <div className="modal-rows">
                        {rows.map((row, index) => (
                            <div key={index} className="modal-row">
                                <span className="modal-col modal-row-num">{index + 1}</span>
                                <div className="modal-col">
                                    <input
                                        type="number"
                                        className={`modal-input ${errors[`${index}-arrivalTime`] ? 'input-error' : ''}`}
                                        placeholder="0"
                                        value={row.arrivalTime}
                                        onChange={e => handleChange(index, 'arrivalTime', e.target.value)}
                                        min="0"
                                    />
                                    {errors[`${index}-arrivalTime`] && (
                                        <span className="field-error">{errors[`${index}-arrivalTime`]}</span>
                                    )}
                                </div>
                                <div className="modal-col">
                                    <input
                                        type="number"
                                        className={`modal-input ${errors[`${index}-burstTime`] ? 'input-error' : ''}`}
                                        placeholder="1"
                                        value={row.burstTime}
                                        onChange={e => handleChange(index, 'burstTime', e.target.value)}
                                        min="1"
                                    />
                                    {errors[`${index}-burstTime`] && (
                                        <span className="field-error">{errors[`${index}-burstTime`]}</span>
                                    )}
                                </div>
                                {showPriority && (
                                    <div className="modal-col">
                                        <input
                                            type="number"
                                            className={`modal-input ${errors[`${index}-priority`] ? 'input-error' : ''}`}
                                            placeholder="1"
                                            value={row.priority}
                                            onChange={e => handleChange(index, 'priority', e.target.value)}
                                            min="0"
                                        />
                                        {errors[`${index}-priority`] && (
                                            <span className="field-error">{errors[`${index}-priority`]}</span>
                                        )}
                                    </div>
                                )}
                                <div className="modal-col modal-col-action">
                                    {rows.length > 1 && (
                                        <button
                                            type="button"
                                            className="modal-remove-row"
                                            onClick={() => removeRow(index)}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button type="button" className="modal-add-row" onClick={addRow}>
                        <span>+</span> Add Another Process
                    </button>

                    <div className="modal-actions">
                        <button type="button" className="modal-cancel" onClick={handleClose}>
                            Cancel
                        </button>
                        <button type="submit" className="modal-submit">
                            Add {rows.length} Process{rows.length > 1 ? 'es' : ''}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddProcessModal;
