# Button Classes Backup

**Created:** December 2024  
**Purpose:** Backup of old button classes that were X-prefixed during button system migration  
**Migration:** From old `.button--*` system to new `.btn--*` system  

This file contains all the deactivated button classes that were safely X-prefixed during the migration. These can be permanently deleted once the new button system is fully tested and confirmed working.

---

## X-Prefixed Button Classes (DEACTIVATED)

### Draft Controls Buttons
```css
.Xdraft-controls__button--save {
    background-color: var(--success-color);
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
}

.Xdraft-controls__button--delete {
    background-color: var(--danger-color);
}

.Xdraft-controls__button--delete:disabled {
    background-color: var(--disabled-bg-color);
    cursor: not-allowed;
    color: var(--text-color-secondary);
}

body.light-mode .Xdraft-controls__button--save,
body.light-mode .Xdraft-controls__button--delete {
    color: white;
}
```

### Main Button Classes
```css
.Xbutton--primary {
    background-color: var(--primary-color);
    color: white;
    border: 1px solid var(--primary-color);
    padding: 0.6rem 0.75rem;
    font-size: 0.9rem;
    font-weight: bold;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.Xbutton--primary:hover {
    background-color: var(--primary-color-hover);
}

body.light-mode .Xbutton--primary {
    color: white;
}

.Xbutton--utility, .Xbutton--edit-mode {
    background-color: var(--input-bg-color);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    padding: 0.25rem 0.75rem;
    font-size: 0.8rem;
    font-weight: normal;
    border-radius: 4px;
    cursor: pointer;
}

.Xbutton--utility:hover, .Xbutton--edit-mode:hover {
    background-color: var(--border-color);
}

.Xbutton--utility.copied {
    background-color: var(--success-color);
    border-color: var(--success-color);
    color: white;
}

.Xbutton--theme {
    padding: 0.25rem 0.5rem;
    font-size: 1.1rem;
    line-height: 1;
}
```

### Specific Button IDs
```css
#Xdelete-project-button { 
    background-color: var(--danger-color); 
    color: white; 
    border-color: var(--danger-color); 
}

#Xedit-project-button { 
    background-color: var(--warning-color); 
    color: #212529; 
    border-color: var(--warning-color); 
}
```

### App Bar Context Overrides
```css
.app-bar__project .Xbutton--primary {
    padding: 0.4rem 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    border-radius: 4px;
}

.app-bar__project .Xbutton--primary svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
}
```

### Tab Bar Context Overrides
```css
.tab-bar__project-controls .Xbutton--primary {
    padding: 0.5rem;
    font-size: 0.9rem;
    line-height: 1;
}

.tab-bar__project-controls .Xbutton--primary svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
    vertical-align: middle;
}
```

---

## Migration Notes

- **Old System**: Used `.button--primary`, `.button--utility`, etc.
- **New System**: Uses `.btn--primary`, `.btn--danger`, etc.
- **X-Prefix Method**: Added "X" prefix to deactivate without deleting
- **JavaScript**: All references updated to use new `.btn` classes
- **Tab System**: Preserved original classes (`.tab-button`) - not migrated

## Cleanup Instructions

Once the new button system is fully tested and confirmed working:

1. Delete all X-prefixed CSS blocks from `main.css`
2. Delete this backup file
3. Update any remaining documentation references

---

**Status**: READY FOR DELETION (after testing confirms new system works) 