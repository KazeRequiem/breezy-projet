/**
 * Champ de formulaire avec label intégré.
 * @param {string}   label       - Texte du label
 * @param {string}   type        - Type de l'input (text, email, password…)
 * @param {string}   placeholder - Placeholder affiché dans l'input
 * @param {string}   value       - Valeur contrôlée
 * @param {function} onChange    - Handler onChange
 */
function InputField({ label, type = 'text', placeholder, value, onChange }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">
                {label}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
        </div>
    )
}

export default InputField
