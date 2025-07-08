import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from '@/store';
import { selectSnackbar, hideSnackbar } from '@/store/snackbarSlice';
import { RootState } from '@/store';

export const useSnackbar = () => {
  const dispatch = useDispatch();
  const snackbar = useSelector((state: RootState) => state.snackbar);

  const handleHideSnackbar = () => {
    dispatch(hideSnackbar());
  };

  return {
    snackbar,
    handleHideSnackbar,
  };
}; 