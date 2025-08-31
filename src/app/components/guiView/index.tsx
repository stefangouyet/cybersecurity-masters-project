'use client';
import { TextField } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import styles from './guiView.module.css';

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
  updateAllowRule: (i: number, key: string, value: string | string[]) => void;
  addFieldType: () => void;
  removeFieldType: (i: number) => void;
  updateFieldType: (i: number, key: string, value: string) => void;
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
}: GuiViewProps) {



  const READ_METHODS = ['get', 'list'];
  const WRITE_METHODS = ['create', 'update', 'delete'];
  const types = ['string', 'number', 'boolean', 'timestamp', 'array', 'map'];

  return (
    <div className={styles.guiSection}>
      {mode === 'auth' ? (
        <>
          <h3 className={styles.heading}>Authorization Rules</h3>
          {allowRules.map((rule, i) => {
            const selected = Array.isArray(rule.method) ? rule.method : rule.method ? [rule.method] : [];

            return (
              <div key={i} className={styles.row}
              // style={getPathStyle(String(rule.collection || ''), String(rule.docId || ''))}
              >
                allow
                <FormControl sx={{ minWidth: 180, marginRight: .5 }} size="small">
                  <Select
                    multiple
                    value={Array.isArray(rule.method) ? rule.method : rule.method ? [rule.method] : []}
                    onChange={(e) => {
                      const val = typeof e.target.value === 'string'
                        ? e.target.value.split(',')
                        : (e.target.value as string[]);
                      updateAllowRule(i, 'method', val);
                    }}
                    renderValue={(sel) => {
                      const arr = Array.isArray(sel) ? sel as string[] : [sel as string];
                      if (arr.length === 1 && arr[0] === 'read') return <span className={styles.readTag}>read</span>;
                      if (arr.length === 1 && arr[0] === 'write') return <span className={styles.writeTag}>write</span>;
                      return arr.join(', ');
                    }}
                  >
                    {['read', ...READ_METHODS, 'write', ...WRITE_METHODS].map(method => {
                      const selectedVals = Array.isArray(rule.method) ? rule.method : rule.method ? [rule.method] : [];
                      return (
                        <MenuItem key={method} value={method}>
                          <Checkbox checked={selectedVals.includes(method)} />
                          <span className={method === 'read' ? styles.readPill : method === 'write' ? styles.readPill : ''}>
                            {method}
                          </span>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>


                {/* if */}
                <span>if</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <div style={{ flex: 1 }}>
                    <TextField
                      value={rule.condition}
                      onChange={(e) => updateAllowRule(i, 'condition', e.target.value)}
                      fullWidth
                      placeholder="Enter condition, e.g. request.auth.uid == resource.data.ownerId"
                      multiline={true}
                      minRows={1}
                      maxRows={6}
                      inputProps={{ style: { whiteSpace: 'pre-wrap', wordBreak: 'break-word' } }}
                    />



                  </div>
                </div>

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
            <div key={i} className={styles.row}
            // style={getPathStyle(field.collection, field.docId)}
            >
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