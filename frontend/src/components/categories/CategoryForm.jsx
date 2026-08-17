import { useState } from 'react';
import { LUCIDE_ICONS, CATEGORY_COLORS } from '../../constants/icons';
import * as LucideIcons from 'lucide-react';
import { X } from 'lucide-react';

const CategoryForm = ({ category, onSubmit, onClose }) => {
  const [name, setName] = useState(category?.name || '');
  const [monthlyBudget, setMonthlyBudget] = useState(category?.monthlyBudget || '');
  const [icon, setIcon] = useState(category?.icon || 'circle');
  const [color, setColor] = useState(category?.color || '#6366f1');
  const [description, setDescription] = useState(category?.description || '');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !monthlyBudget) return;
    setLoading(true);
    try {
      await onSubmit({
        name,
        monthlyBudget: parseFloat(monthlyBudget),
        icon,
        color,
        description,
      });
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName) => {
    const formatted = iconName
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    return LucideIcons[formatted] || LucideIcons.Circle;
  };

  const SelectedIcon = getIconComponent(icon);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
            {category ? 'Edit Category' : 'Create Category'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Food, Shopping, Travel"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
              style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              required
            />
          </div>

          {/* Monthly Budget */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Monthly Budget (₹)
            </label>
            <input
              type="number"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
              placeholder="e.g. 2000"
              min="0"
              step="1"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
              style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              required
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Icon
            </label>
            <button
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm transition-all duration-200"
              style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${color}20`, color: color }}
              >
                <SelectedIcon className="w-4 h-4" />
              </div>
              <span>
                {LUCIDE_ICONS.find((i) => i.name === icon)?.label || icon}
              </span>
            </button>

            {showIconPicker && (
              <div
                className="mt-2 p-3 rounded-xl grid grid-cols-6 gap-2 max-h-48 overflow-y-auto"
                style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
              >
                {LUCIDE_ICONS.map((item) => {
                  const Ic = getIconComponent(item.name);
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => { setIcon(item.name); setShowIconPicker(false); }}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors hover:bg-white/5"
                      title={item.label}
                      style={icon === item.name ? { background: 'var(--color-primary-muted)' } : {}}
                    >
                      <Ic className="w-5 h-5" style={{ color: icon === item.name ? 'var(--color-primary)' : 'var(--color-text-secondary)' }} />
                      <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-lg transition-all duration-200 hover:scale-110"
                  style={{
                    background: c,
                    outline: color === c ? '2px solid var(--color-text)' : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 resize-none"
              style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name || !monthlyBudget}
              className="flex-1 btn-primary"
            >
              {loading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
