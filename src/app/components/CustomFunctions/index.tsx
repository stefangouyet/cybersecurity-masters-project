'use client';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedFunctions, setUseCustomFunctions } from '@/store/slice';
import { Box, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import styles from './CustomFunctions.module.css';

export default function CustomFunctions() {
  const dispatch = useAppDispatch();
  const { useCustomFunctions, selectedFunctions } = useAppSelector(state => state.reducer.settings);
  const [open, setOpen] = useState(false);

  const toggleOpen = () => setOpen(!open);

  const handleFunctionToggle = (func: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    const newSelectedFunctions = checked
      ? [...selectedFunctions, func]
      : selectedFunctions.filter(f => f !== func);
    dispatch(setSelectedFunctions(newSelectedFunctions));
  };

  const functionOptions = [
    { name: 'isAuthenticated', label: 'isAuthenticated() - Checks if user is authenticated' },
    { name: 'isDocOwner', label: 'isDocOwner(userId) - Checks if user owns the document' },
    { name: 'isAdmin', label: 'isAdmin() - Checks if user has admin privileges' },
    { name: 'isActiveUser', label: 'isActiveUser() - Checks if user account is active' },
  ];

  return (
    <Box className={styles.wrapper}>
      <button className={styles.toggle} onClick={toggleOpen}>
        <span>Custom Functions</span>
        {open ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      {open && (
        <Box className={styles.content}>
          <FormControlLabel
            control={
              <Checkbox
                checked={useCustomFunctions}
                onChange={(e) => dispatch(setUseCustomFunctions(e.target.checked))}
                color="primary"
              />
            }
            label={<Typography variant="body1">Enable Custom Functions</Typography>}
          />
          {useCustomFunctions && (
            <FormGroup className={styles.functionList}>
              {functionOptions.map(({ name, label }) => (
                <FormControlLabel
                  key={name}
                  control={
                    <Checkbox
                      checked={selectedFunctions.includes(name)}
                      onChange={handleFunctionToggle(name)}
                      color="primary"
                    />
                  }
                  label={<Typography variant="body2">{label}</Typography>}
                />
              ))}
            </FormGroup>
          )}
        </Box>
      )}
    </Box>
  );
}