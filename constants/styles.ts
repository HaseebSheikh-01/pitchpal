import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from './theme';

export const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
  },
  backButton: {
    position: 'absolute',
    top: 32,
    left: 24,
    padding: 8
  },
  backButtonText: {
    color: COLORS.success,
    fontSize: 16,
    fontWeight: '600'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 48
  },
  description: {
    fontSize: 16,
    color: COLORS.placeholder,
    marginTop: 8,
  },
  navButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: 16
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600'
  }
});
