import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setPincode,
  setPincodeData,
  setPincodeLoading,
  setPincodeError,
  clearPincode
} from '@/store/slice/pincode/pincodeSlice';
import { checkPincode } from '@/service/user/cartService';

export const usePincode = () => {
  const dispatch = useAppDispatch();
  const { value: pincode, data: pincodeData, loading, error } = useAppSelector(
    (state) => state.pincode
  );

  /**
   * Check if pincode is already saved in Redux state
   * @returns boolean indicating if pincode exists
   */
  const hasSavedPincode = useCallback(() => {
    return !!pincode && !!pincodeData;
  }, [pincode, pincodeData]);

  /**
   * Validate pincode using the API
   * @param pincode - 6-digit pincode string
   * @returns Promise with validation result
   */
  const validatePincode = useCallback(async (pincode: string) => {
    dispatch(setPincodeLoading(true));
    dispatch(setPincodeError(""));

    try {
      const response = await checkPincode(pincode);

      if (response.success && response.data.available) {
        dispatch(setPincode(pincode));
        dispatch(setPincodeData(response.data));
        return {
          success: true,
          data: response.data,
          message: response.message || "Pincode validated successfully"
        };
      } else {
        dispatch(setPincodeError(response.message || "Delivery not available for this pincode"));
        return {
          success: false,
          data: null,
          message: response.message || "Delivery not available for this pincode"
        };
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to validate pincode";
      dispatch(setPincodeError(errorMessage));
      return {
        success: false,
        data: null,
        message: errorMessage
      };
    } finally {
      dispatch(setPincodeLoading(false));
    }
  }, [dispatch]);

  /**
   * Save pincode and validation data to Redux state
   * @param pincodeValue - The pincode string
   * @param validationData - The validation response data
   */
  const savePincode = useCallback((pincodeValue: string, validationData: any) => {
    dispatch(setPincode(pincodeValue));
    dispatch(setPincodeData(validationData));
    dispatch(setPincodeError(""));
  }, [dispatch]);

  /**
   * Clear all pincode data from Redux state
   */
  const clearPincodeData = useCallback(() => {
    dispatch(clearPincode());
  }, [dispatch]);

  /**
   * Check if pincode needs to be collected before proceeding with cart actions
   * @returns boolean - true if pincode dialog should be shown, false if can proceed
   */
  const shouldShowPincodeDialog = useCallback(() => {
    return !hasSavedPincode();
  }, [hasSavedPincode]);

  return {
    // State
    pincode,
    pincodeData,
    loading,
    error,
    hasSavedPincode: hasSavedPincode(),

    // Actions
    validatePincode,
    savePincode,
    clearPincodeData,
    shouldShowPincodeDialog,
  };
};
