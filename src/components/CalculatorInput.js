import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// ── Safe expression evaluator (no eval) ──────────────────────────────────────
function evaluateExpression(expr) {
  // Remove spaces
  const cleaned = expr.replace(/\s/g, '');
  if (!cleaned) return 0;

  // Tokenize into numbers and operators (+ and - only)
  const tokens = [];
  let current = '';

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if ((ch === '+' || ch === '-') && current.length > 0) {
      tokens.push(parseFloat(current));
      tokens.push(ch);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(parseFloat(current));

  // Evaluate left-to-right
  if (tokens.length === 0) return 0;
  let result = typeof tokens[0] === 'number' ? tokens[0] : 0;
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i];
    const num = typeof tokens[i + 1] === 'number' ? tokens[i + 1] : 0;
    if (op === '+') result += num;
    else if (op === '-') result -= num;
  }

  return isNaN(result) ? 0 : result;
}

function hasOperator(text) {
  // Check if expression contains + or - (not at the start)
  return /[+\-]/.test(text.slice(1));
}

export default function CalculatorInput({ value, onValueChange, onAmountResolved }) {
  const [expression, setExpression] = useState(value || '');
  const [previewResult, setPreviewResult] = useState(null);

  useEffect(() => {
    // Sync from parent when value changes externally
    if (value !== expression) {
      setExpression(value || '');
    }
  }, [value]);

  const handleChange = useCallback((text) => {
    // Only allow digits, dots, + and -
    const sanitized = text.replace(/[^0-9.+\-]/g, '');
    setExpression(sanitized);
    onValueChange(sanitized);

    // Show preview if expression has operators
    if (hasOperator(sanitized)) {
      const result = evaluateExpression(sanitized);
      setPreviewResult(result);
    } else {
      setPreviewResult(null);
    }
  }, [onValueChange]);

  const handleCalculate = useCallback(() => {
    if (!hasOperator(expression)) return;
    const result = evaluateExpression(expression);
    const rounded = Math.round(result * 100) / 100;
    const resultStr = rounded.toString();
    setExpression(resultStr);
    onValueChange(resultStr);
    setPreviewResult(null);
    onAmountResolved?.(rounded);
  }, [expression, onValueChange, onAmountResolved]);

  return (
    <View style={styles.container}>
      {/* Main input row */}
      <View style={styles.inputRow}>
        <Text style={styles.currencyPrefix}>₹</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          value={expression}
          onChangeText={handleChange}
          keyboardType="default"
        />
        {hasOperator(expression) && (
          <Pressable
            style={({ pressed }) => [styles.calcBtn, pressed && { opacity: 0.8 }]}
            onPress={handleCalculate}
          >
            <Ionicons name="calculator" size={16} color={colors.white} />
            <Text style={styles.calcBtnText}>=</Text>
          </Pressable>
        )}
      </View>

      {/* Preview result */}
      {previewResult !== null && (
        <View style={styles.previewRow}>
          <Ionicons name="arrow-forward" size={12} color={colors.primary} />
          <Text style={styles.previewText}>
            = ₹{previewResult.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
      )}

      {/* Operator hints */}
      <View style={styles.hintRow}>
        <Text style={styles.hintText}>Tip: use</Text>
        <View style={styles.hintOp}><Text style={styles.hintOpText}>+</Text></View>
        <View style={styles.hintOp}><Text style={styles.hintOpText}>−</Text></View>
        <Text style={styles.hintText}>to calculate</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyPrefix: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textMuted,
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  calcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  calcBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  // Preview
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  previewText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  // Hint
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  hintText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  hintOp: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintOpText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});
