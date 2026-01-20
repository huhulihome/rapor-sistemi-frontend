/**
 * Form validation utilities
 */

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule[];
}

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Validate a single field against its rules
 */
export const validateField = (
  value: any,
  rules: ValidationRule[]
): string | null => {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      return rule.message;
    }
  }
  return null;
};

/**
 * Validate all fields in a form
 */
export const validateForm = (
  values: Record<string, any>,
  rules: ValidationRules
): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach((fieldName) => {
    const error = validateField(values[fieldName], rules[fieldName]);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return errors;
};

/**
 * Common validation rules
 */
export const validationRules = {
  required: (message = 'Bu alan zorunludur'): ValidationRule => ({
    validate: (value) => {
      if (typeof value === 'string') {
        return value.trim().length > 0;
      }
      return value !== null && value !== undefined;
    },
    message
  }),

  email: (message = 'Geçerli bir email adresi giriniz'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Allow empty, use required rule separately
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message
  }),

  minLength: (
    length: number,
    message = `En az ${length} karakter olmalıdır`
  ): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      return value.length >= length;
    },
    message
  }),

  maxLength: (
    length: number,
    message = `En fazla ${length} karakter olmalıdır`
  ): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      return value.length <= length;
    },
    message
  }),

  pattern: (
    regex: RegExp,
    message = 'Geçersiz format'
  ): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      return regex.test(value);
    },
    message
  }),

  min: (
    minValue: number,
    message = `En az ${minValue} olmalıdır`
  ): ValidationRule => ({
    validate: (value) => {
      if (value === null || value === undefined || value === '') return true;
      return Number(value) >= minValue;
    },
    message
  }),

  max: (
    maxValue: number,
    message = `En fazla ${maxValue} olmalıdır`
  ): ValidationRule => ({
    validate: (value) => {
      if (value === null || value === undefined || value === '') return true;
      return Number(value) <= maxValue;
    },
    message
  }),

  match: (
    _otherFieldName: string,
    message = 'Alanlar eşleşmiyor'
  ): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      // Note: This rule needs access to other form values
      // It should be used with a form validation context
      return true; // Simplified for now
    },
    message
  })
};

/**
 * Custom hook for form validation
 */
export const useFormValidation = (
  initialValues: Record<string, any>,
  rules: ValidationRules
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    
    // Validate field if it has been touched
    if (touched[name] && rules[name]) {
      const error = validateField(value, rules[name]);
      setErrors((prev) => ({
        ...prev,
        [name]: error || ''
      }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    if (rules[name]) {
      const error = validateField(values[name], rules[name]);
      setErrors((prev) => ({
        ...prev,
        [name]: error || ''
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors = validateForm(values, rules);
    setErrors(newErrors);
    setTouched(
      Object.keys(rules).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset,
    setValues
  };
};

// Import useState for the hook
import { useState } from 'react';
