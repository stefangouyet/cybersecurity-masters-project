'use client';

import styles from './GuiView.module.css';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import ListSubheader from '@mui/material/ListSubheader';
import Checkbox from '@mui/material/Checkbox';
import OutlinedInput from '@mui/material/OutlinedInput';

interface Rule {
  method: string | string[];
  condition: string;
  collection?: string;
  docId?: string;
  action?: string;
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
  addAllowRule: () => void;
  removeAllowRule: (i: number) => void;
  updateAllowRule: (i: number, key: string, value: string) => void;
  addFieldType: () => void;
  removeFieldType: (i: number) => void;
  updateFieldType: (i: number, key: string, value: string) => void;
  functions: { name: string; description: string }[];
  types: string[];
}

const READ_METHODS = ['get', 'list'];
const WRITE_METHODS = ['create', 'update', 'delete'];
const GROUPS = [
  { label: 'Read', methods: READ_METHODS },
  { label: 'Write', methods: WRITE_METHODS },
];

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
  const getPathStyle = (collection: string | undefined, docId: string | undefined) => {
    const fullPath = `/${collection || ''}/${docId || ''}`;
    const option = collectionDocOptions.find(opt => opt.path === fullPath);
    return option ? { backgroundColor: option.color } : {};
  };

  const collectionDocOptions = [
    { path: '/users/{usersId}', color: '#e6f3ff' },
    { path: '/users/{userId}/answers', color: '#ffe6e6' },
    { path: '/members/{membersId}', color: '#e6ffe6' },
    { path: '/families/{familiesId}', color: '#fff3e6' },
    { path: '/chats/{chatsId}', color: '#f0e6ff' },
  ];

  return (
    <div className={styles.guiSection}>
      {mode === 'auth' ? (
        <>
          <h3 className={styles.heading}>Authorization Rules</h3>
          {allowRules.map((rule, i) => {
            const selected = Array.isArray(rule.method) ? rule.method : rule.method ? [rule.method] : [];

            return (
              <div key={i} className={styles.row} style={getPathStyle(String(rule.collection || ''), String(rule.docId || ''))}>
                allow
                <FormControl sx={{ minWidth: 180, marginRight: 1 }} size="small">
                  <InputLabel id={`method-select-label-${i}`}>Method</InputLabel>
                  <Select
                    labelId={`method-select-label-${i}`}
                    multiple
                    value={Array.isArray(rule.method) ? rule.method : rule.method ? [rule.method] : []}
                    onChange={e => {
                      const value = e.target.value;
                      updateAllowRule(i, 'method', value);
                    }}
                    renderValue={selected => {
                      const selectedArr = Array.isArray(selected) ? selected : [selected];
                      if (READ_METHODS.every(m => selectedArr.includes(m))) return 'read';
                      if (WRITE_METHODS.every(m => selectedArr.includes(m))) return 'write';
                      return selectedArr.join(', ');
                    }}

                  >
                    <ListSubheader>Read</ListSubheader>
                    {READ_METHODS.map(method => (
                      <MenuItem key={method} value={method}>
                        <Checkbox checked={selected.includes(method)} />
                        {method}
                      </MenuItem>
                    ))}
                    <ListSubheader>Write</ListSubheader>
                    {WRITE_METHODS.map(method => (
                      <MenuItem key={method} value={method}>
                        <Checkbox checked={selected.includes(method)} />
                        {method}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                : if
                <select
                  value={functions.some(fn => fn.name === rule.condition) ? rule.condition : 'custom'}
                  onChange={(e) => {
                    if (e.target.value === 'custom') return;
                    updateAllowRule(i, 'condition', e.target.value);
                  }}
                  className={styles.select}
                >
                  {functions.map(fn => (
                    <option key={fn.name} value={fn.name}>{fn.name}</option>
                  ))}
                  <option value="custom">Custom...</option>
                </select>
                {(!functions.some(fn => fn.name === rule.condition) || rule.condition === 'custom') && (
                  <input
                    type="text"
                    value={rule.condition}
                    onChange={e => updateAllowRule(i, 'condition', e.target.value)}
                    placeholder="Enter custom condition"
                    className={styles.input}
                    style={{ marginLeft: 8, minWidth: 180 }}
                  />
                )}
                <button className={styles.delete} onClick={() => removeAllowRule(i)}>−</button>
              </div>
            );
          })}
          <button className={styles.add} onClick={addAllowRule}>+ Add Rule</button>
        </>
      ) : (
        <>
          <h3 className={styles.heading}>Field Types</h3>
          {fieldTypes.map((field, i) => (
            <div key={i} className={styles.row} style={getPathStyle(field.collection, field.docId)}>
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
          <button className={styles.add} onClick={addFieldType}>+ Add Field</button>
        </>
      )}
    </div>
  );
}
