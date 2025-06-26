'use client';

import styles from './guiView.module.css';

interface Rule {
  collection: string;
  docId: string;
  action: string;
  condition: string;
}

interface Field {
  collection: string;
  docId: string;
  field: string;
  type: string;
}

interface GuiViewProps {
  mode: 'auth' | 'types';
  allowRules: Rule[];
  fieldTypes: Field[];
  addAllowRule: (collection?: string) => void;
  removeAllowRule: (i: number) => void;
  updateAllowRule: (i: number, key: string, value: string) => void;
  addFieldType: (collection?: string) => void;
  removeFieldType: (i: number) => void;
  updateFieldType: (i: number, key: string, value: string) => void;
  functions: { name: string; description: string }[];
  types: string[];
}

export default function GuiView({
  mode,
  allowRules,
  fieldTypes,
  addAllowRule,
  removeAllowRule,
  updateAllowRule,
  addFieldType,
  removeFieldType,
  updateFieldType,
  functions,
  types,
}: GuiViewProps) {
  return (
    <div className={styles.guiSection}>
      {mode === 'auth' ? (
        <>
          <h3 className={styles.heading}>Authorization Rules</h3>
          {allowRules.map((rule, i) => (
            <div key={i} className={styles.row}>
              <span className={styles.label}>Collection/Doc: /{rule.collection}/{rule.docId}</span>
              allow
              <select value={rule.action} onChange={(e) => updateAllowRule(i, 'action', e.target.value)} className={styles.select}>
                <option value="read">read</option>
                <option value="write">write</option>
                <option value="read, write">read, write</option>
              </select>
              : if
              <select value={rule.condition} onChange={(e) => updateAllowRule(i, 'condition', e.target.value)} className={styles.select}>
                {functions.map(fn => (
                  <option key={fn.name} value={fn.name}>{fn.name}</option>
                ))}
              </select>
              <button className={styles.delete} onClick={() => removeAllowRule(i)}>−</button>
            </div>
          ))}
          <button className={styles.add} onClick={() => addAllowRule()}>+ Add Rule</button>
        </>
      ) : (
        <>
          <h3 className={styles.heading}>Field Types</h3>
          {fieldTypes.map((field, i) => (
            <div key={i} className={styles.row}>
              <span className={styles.label}>Collection/Doc: /{field.collection}/{field.docId}</span>
              <input
                value={field.field}
                onChange={(e) => updateFieldType(i, 'field', e.target.value)}
                placeholder="field"
                className={styles.input}
              />
              <select value={field.type} onChange={(e) => updateFieldType(i, 'type', e.target.value)} className={styles.select}>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <button className={styles.delete} onClick={() => removeFieldType(i)}>−</button>
            </div>
          ))}
          <button className={styles.add} onClick={() => addFieldType()}>+ Add Field</button>
        </>
      )}
    </div>
  );
}