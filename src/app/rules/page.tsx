'use client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedFunctions } from '@/store/slice';
import { AddCircleOutlineOutlined } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import CodeView from '../components/codeView';
import CustomFunctions from '../components/custom';
import Explanation from '../components/explanation';
import GuiView from '../components/guiView';
import styles from './rules.module.css';

export default function RulesPage() {
  const dispatch = useAppDispatch();
  const { generatedRules, rulesExplanation } = useAppSelector(state => state.reducer.rules);
  const { useCustomFunctions, selectedFunctions } = useAppSelector(state => state.reducer.settings);

  const [allRules, setAllRules] = useState<Record<string, { method: string[]; condition: string }[]>>({});
  const [selectedPath, setSelectedPath] = useState('');
  const [paths, setPaths] = useState<string[]>([]);
  const [rulesState, setRulesState] = useState('');
  const [addPathDialogOpen, setAddPathDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newDocWildcard, setNewDocWildcard] = useState('');

  const parseFirestoreRules = (rules: string) => {
    const pathRegex = /^\s*match\s+\/?(\/?[^\s{]+(\s*{[^}]+})?)\s*\{/;
    const allowRegex = /^\s*allow\s+([a-z,\s]+):\s*if\s+(.+);/;
    const lines = rules.split('\n');
    const parsed: Record<string, { method: string[]; condition: string }[]> = {};
    const pathStack: string[] = [];
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('match')) {
        const match = trimmedLine.match(pathRegex);
        if (match) {
          pathStack.push(match[1]); // Capture full path including {userId}
        }
      } else if (trimmedLine.startsWith('allow')) {
        const allow = trimmedLine.match(allowRegex);
        if (allow && pathStack.length > 0) {
          const rawMethods = allow[1].split(',').map(m => m.trim());
          const condition = allow[2].trim();
          let fullPath = '/' + pathStack.join('/').replace(/\/+/g, '/');
          fullPath = fullPath.replace(/^\/?databases\/\{database\}\/documents/, ''); // Remove Firestore base prefix
          fullPath = fullPath.replace(/\/+$/, '').replace(/^\/+/, '');
          const cleanPath = fullPath
            .replace(/^databases\//, '')
            .replace(/^\/+/, '')
            .replace(/\/+$/, '');
          if (!parsed[cleanPath]) parsed[cleanPath] = [];
          parsed[cleanPath].push({ method: Array.from(new Set(rawMethods)), condition });
        }
      } else if (trimmedLine.startsWith('}')) {
        pathStack.pop();
      }
    });
    return parsed;
  };

  const buildNestedRuleTree = (rulesObj: Record<string, { method: string[]; condition: string }[]>) => {
    const tree: any = {};
    for (const fullPath in rulesObj) {
      const relativePath = fullPath.replace(/^\/?databases\/\{database\}\/documents/, '').replace(/^\/+/, '');
      const segments = relativePath.split('/').filter(Boolean);
      let current = tree;
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (!current[segment]) {
          current[segment] = { __rules: [], __children: {} };
        }
        if (i === segments.length - 1) {
          current[segment].__rules = [...(current[segment].__rules || []), ...rulesObj[fullPath]];
        }
        current = current[segment].__children;
      }
    }
    return tree;
  }

  // 1) helper: right-trim only (no left trim)
  const rtrim = (s: string) => s.replace(/[ \t\r\n]+$/, '');

  // 2) generateRulesCode: start at indentLevel = 2 (one deeper than /documents)
  const generateRulesCode = (tree: any, indentLevel: number = 2): string => {
    let code = '';
    const indent = '  '.repeat(indentLevel);        // indent for "match" line
    const ruleIndent = '  '.repeat(indentLevel + 1); // indent for "allow" lines

    const segments = Object.keys(tree);
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const node = tree[segment];
      const childSegments = Object.keys(node.__children);

      let matchLine = `${indent}match /${segment}`;
      let innerTree = node.__children;
      let rulesToAdd = node.__rules;

      // fold single wildcard child into path for nicer output
      if (childSegments.length === 1 && childSegments[0].startsWith('{')) {
        const wildcard = childSegments[0];
        matchLine += `/${wildcard}`;
        const wildcardNode = node.__children[wildcard];
        innerTree = wildcardNode.__children;
        rulesToAdd = wildcardNode.__rules;
      }

      code += `${matchLine} {\n`;

      for (const rule of rulesToAdd) {
        const methods = rule.method.join(', ');
        const conditionInline = rule.condition
          .replace(/\s*\n+\s*/g, ' ')
          .replace(/\s{2,}/g, ' ')
          .trim();
        code += `${ruleIndent}allow ${methods}: if ${conditionInline};\n`;
      }

      if (Object.keys(innerTree).length > 0) {
        code += generateRulesCode(innerTree, indentLevel + 1);
      }

      code += `${indent}}\n`;
      if (i < segments.length - 1) code += `\n`; // blank line between siblings
    }

    return code;
  };




  const updateAllowRule = (index: number, key: string, value: any) => {
    setAllRules(prev => {
      const updated = { ...prev };
      if (!updated[selectedPath]) return updated;
      updated[selectedPath] = updated[selectedPath].map((rule, i) =>
        i === index ? { ...rule, [key]: value } : rule
      );
      return updated;
    });
  };

  const addAllowRule = () => {
    if (!selectedPath) return;
    setAllRules(prev => ({
      ...prev,
      [selectedPath]: [...(prev[selectedPath] || []), { method: ['read'], condition: '' }],
    }));
  };

  const removeAllowRule = (i: number) => {
    setAllRules(prev => {
      const updated = { ...prev };
      if (!updated[selectedPath]) return updated;
      updated[selectedPath] = updated[selectedPath].filter((_, idx) => idx !== i);
      return updated;
    });
  };


  const handleAddPath = () => {
    const collection = newCollectionName.trim();
    const wildcard = newDocWildcard.trim();

    if (!collection) return; // Require at least a collection name

    let formattedWildcard = '';
    if (wildcard) {
      // Normalize to {docId}
      formattedWildcard = wildcard;
      if (!formattedWildcard.startsWith('{') || !formattedWildcard.endsWith('}')) {
        formattedWildcard = `{${formattedWildcard.replace('*', 'docId').replace(/^{|}$/g, '')}}`;
      }
    }

    const newPath = formattedWildcard ? `${collection}/${formattedWildcard}` : collection;

    if (!paths.includes(newPath)) {
      setPaths(prev => [...prev, newPath]);
      setSelectedPath(newPath);
      setAllRules(prev => ({
        ...prev,
        [newPath]: [],
      }));
    }

    // Reset dialog + fields
    setAddPathDialogOpen(false);
    setNewCollectionName('');
    setNewDocWildcard('');
  };

  // Use Effect #1
  useEffect(() => {
    if (generatedRules) {
      const start = generatedRules.indexOf("rules_version = '2';");
      let body = '';
      if (start !== -1) {
        const afterStart = generatedRules.slice(start);
        const lastBrace = afterStart.lastIndexOf('}');
        body = lastBrace !== -1 ? afterStart.slice(0, lastBrace + 1) : afterStart;
      }
      const cleaned = body
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//') && !line.startsWith('```'))
        .join('\n');
      const parsed = parseFirestoreRules(cleaned);
      setAllRules(parsed);
      const cleanPaths = Object.keys(parsed).map(p =>
        p
          .replace(/^\/?databases\/\{database\}\/documents/, '')
          .replace(/^databases\//, '')
          .replace(/^\/+/, '')
          .replace(/\/+$/, '')
      );
      setPaths(cleanPaths);
      setSelectedPath(cleanPaths[0] || '');
      setRulesState(generatedRules);
    }
  }, [generatedRules]);

  // Use Effect #2
  useEffect(() => {
    if (Object.keys(allRules).length === 0) return;

    const tree = buildNestedRuleTree(allRules);
    const matchesCode = rtrim(generateRulesCode(tree));

    // --- Detect which toggleable helpers are referenced in the rules text ---
    const usedToggleables = new Set<string>();
    const toggleableUseRe = /\b(isAuthenticated|isDocOwner|isAdmin|isActiveUser)\s*\(/g;
    let tm: RegExpExecArray | null;
    while ((tm = toggleableUseRe.exec(matchesCode)) !== null) {
      usedToggleables.add(tm[1]);
    }

    // --- Ensure the UI reflects any functions required by the rules (union) ---
    const unionSelected = Array.from(new Set([...(selectedFunctions || []), ...usedToggleables]));
    const selectedChanged =
      unionSelected.length !== (selectedFunctions || []).length ||
      unionSelected.some(n => !(selectedFunctions || []).includes(n));
    if (selectedChanged) {
      dispatch(setSelectedFunctions(unionSelected));
    }

    // Names to actually include in the code view:
    // - If custom functions are enabled, include the UNION of user selections and functions used in rules
    // - If disabled, include none.
    const namesToInclude = useCustomFunctions ? unionSelected : [];

    // —— Extract ANY function definitions the model already emitted
    const fnRegex = /function\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{[\s\S]*?\}/g;
    const openAiFns: { name: string; body: string }[] = [];
    let m: RegExpExecArray | null;
    while ((m = fnRegex.exec(generatedRules)) !== null) {
      openAiFns.push({ name: m[1], body: m[0] });
    }
    const openAiByName = new Map(openAiFns.map(f => [f.name, f.body]));

    // Keep any non-toggleable helpers the model may have provided
    const finalBodies: string[] = [];
    const added = new Set<string>();
    const TOGGLEABLE_FUNCTIONS = ['isAuthenticated', 'isDocOwner', 'isAdmin', 'isActiveUser'] as const;
    type ToggleableFn = typeof TOGGLEABLE_FUNCTIONS[number];

    for (const f of openAiFns) {
      if (!TOGGLEABLE_FUNCTIONS.includes(f.name as ToggleableFn)) {
        const normalized =
          /\n/.test(f.body)
            ? f.body
            : f.body.replace(/\{\s*return\s+/g, '{\n  return ').replace(/;\s*\}/g, ';\n}');
        finalBodies.push(normalized);
        added.add(f.name);
      }
    }

    // Helper to synthesize definitions for toggleables if the model didn't emit them
    const customFnSnippet = (name: ToggleableFn) => {
      switch (name) {
        case 'isAuthenticated':
          return '  function isAuthenticated() {\n    return request.auth != null;\n  }';
        case 'isDocOwner':
          return '  function isDocOwner(userId) {\n    return request.auth.uid == userId;\n  }';
        case 'isAdmin':
          return '  function isAdmin() {\n    return request.auth.token.admin === true;\n  }';
        case 'isActiveUser':
          return '  function isActiveUser() {\n    return request.auth.token.active === true;\n  }';
      }
    }

    // Include the toggleable helpers according to namesToInclude
    if (useCustomFunctions) {
      namesToInclude.forEach((name) => {
        let body = openAiByName.get(name) ?? customFnSnippet(name as ToggleableFn);
        if (body && !added.has(name)) {
          if (!/\n/.test(body)) {
            body = body
              .replace(/\{\s*return\s+/g, '{\n  return ')
              .replace(/;\s*\}/g, ';\n}');
          }
          finalBodies.push(body);
          added.add(name);
        }
      });
    }

    // Indent functions so they sit inside the documents block
    const functionsCode = finalBodies.join('\n\n');
    const indentedFunctions = functionsCode
      ? functionsCode.split('\n').map(line => '  ' + line).join('\n') + '\n'
      : '';

    const updatedRulesState = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
${indentedFunctions ? indentedFunctions + '\n' : ''}${matchesCode}
  }
}
`;

    setRulesState(updatedRulesState);
  }, [allRules, useCustomFunctions, selectedFunctions, generatedRules, dispatch]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.leftPanel}>
          {paths.length > 0 ? (
            <>
              <div className={styles.dropdownContainer}>
                <FormControl fullWidth variant="outlined" size="small" style={{ minWidth: 300 }}>
                  <InputLabel id="path-select-label">Select Path/Collection</InputLabel>
                  <Select
                    labelId="path-select-label"
                    value={selectedPath}
                    onChange={(e) => setSelectedPath(e.target.value)}
                    label="Select Path/Collection"
                  >
                    {paths.map(path => (
                      <MenuItem key={path} value={path}>
                        {path}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Tooltip title="Add a new collection">
                  <IconButton
                    color="primary"
                    size="small"
                    style={{ marginLeft: 8, height: '40px' }}
                    onClick={() => setAddPathDialogOpen(true)}
                  >
                    <AddCircleOutlineOutlined />
                  </IconButton>
                </Tooltip>
                <Dialog open={addPathDialogOpen} onClose={() => setAddPathDialogOpen(false)}>
                  <DialogTitle>Add New Path/Collection to Firestore Rules</DialogTitle>
                  <DialogContent>
                    <TextField
                      autoFocus
                      margin="dense"
                      label="Collection Name"
                      type="text"
                      fullWidth
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                    />
                    <TextField
                      margin="dense"
                      label="Document Wildcard (e.g., {docId}*)"
                      type="text"
                      fullWidth
                      value={newDocWildcard}
                      onChange={(e) => setNewDocWildcard(e.target.value)}
                      helperText="Add * for wildcard, e.g., {docId}*"
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setAddPathDialogOpen(false)} color="primary">
                      Cancel
                    </Button>
                    <Button onClick={handleAddPath} color="primary">
                      Add
                    </Button>
                  </DialogActions>
                </Dialog>
              </div>
              <GuiView
                mode="auth"
                allowRules={allRules[selectedPath] || []}
                fieldTypes={[]}
                addAllowRule={addAllowRule}
                removeAllowRule={removeAllowRule}
                updateAllowRule={(i, k, v) => updateAllowRule(i, k, v)}
                addFieldType={() => { }}
                removeFieldType={() => { }}
                updateFieldType={() => { }}
              />
            </>
          ) : (
            <div className={styles.noRules}>
              <p>No valid rules parsed.</p>
              <p>Generate rules from your Firestore code on the <a href="/">Home</a> page.</p>
            </div>
          )}
        </div>
        <div className={styles.rightPanel}>
          <CodeView
            rulesState={rulesState}
            selectedPath={selectedPath}
            error={''}
          />
          {rulesExplanation && <Explanation explanation={rulesExplanation} />}
          <CustomFunctions />
        </div>
      </div>
    </div>
  );
}