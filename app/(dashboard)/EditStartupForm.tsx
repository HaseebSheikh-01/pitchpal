import React, { useState, useRef, useEffect } from 'react';
import { Modal, TextInput, TouchableOpacity, View, Text, StyleSheet, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_IP from '../../constants/apiConfig';

const stages = [
  'Seed', 'Bootstrap', 'Early Stage', 'Growth Stage', 'Late Stage'
];

interface Startup {
  id: string;
  name: string;
  funding_total_usd: number;
  funding_rounds: number;
  continent: string;
  country: string;
  stage_of_business: string;
  industry: string;
  team_size: number;
  revenue_usd: number;
  consumer_base: number;
  image: string | null;
}

interface EditStartupFormProps {
  visible: boolean;
  onClose: () => void;
  startup: Startup;
  onUpdate: (updatedStartup: Startup) => void;
}

const EditStartupForm: React.FC<EditStartupFormProps> = ({ visible, onClose, startup, onUpdate }) => {
  const [name, setName] = useState(startup?.name || '');
  const [funding_total_usd, setFundingTotalUsd] = useState(startup?.funding_total_usd?.toString() || '0');
  const [funding_rounds, setFundingRounds] = useState(startup?.funding_rounds?.toString() || '0');
  const [stage_of_business, setStageOfBusiness] = useState(startup?.stage_of_business || '');
  const [team_size, setTeamSize] = useState(startup?.team_size?.toString() || '0');
  const [revenue_usd, setRevenueUsd] = useState(startup?.revenue_usd?.toString() || '0');
  const [consumer_base, setConsumerBase] = useState(startup?.consumer_base?.toString() || '0');
  const [showStageModal, setShowStageModal] = useState(false);

  // Error states
  const [nameError, setNameError] = useState('');
  const [fundingError, setFundingError] = useState('');
  const [roundsError, setRoundsError] = useState('');
  const [teamSizeError, setTeamSizeError] = useState('');
  const [revenueError, setRevenueError] = useState('');
  const [consumerBaseError, setConsumerBaseError] = useState('');

  // Validation functions
  const validateName = (text: string) => {
    const nameRegex = /^[a-zA-Z0-9\s]+$/;
    if (!text.trim()) {
      setNameError('Name is required');
      return false;
    }
    if (!nameRegex.test(text)) {
      setNameError('Name can only contain letters, numbers, and spaces');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateNumeric = (text: string, field: string) => {
    const numericRegex = /^\d*$/;
    if (!numericRegex.test(text)) {
      switch (field) {
        case 'funding':
          setFundingError('Please enter numbers only');
          return false;
        case 'rounds':
          setRoundsError('Please enter numbers only');
          return false;
        case 'team':
          setTeamSizeError('Please enter numbers only');
          return false;
        case 'revenue':
          setRevenueError('Please enter numbers only');
          return false;
        case 'consumer':
          setConsumerBaseError('Please enter numbers only');
          return false;
      }
    }
    switch (field) {
      case 'funding':
        setFundingError('');
        break;
      case 'rounds':
        setRoundsError('');
        break;
      case 'team':
        setTeamSizeError('');
        break;
      case 'revenue':
        setRevenueError('');
        break;
      case 'consumer':
        setConsumerBaseError('');
        break;
    }
    return true;
  };

  // Reset form fields when startup prop changes
  useEffect(() => {
    setName(startup?.name || '');
    setFundingTotalUsd(startup?.funding_total_usd?.toString() || '0');
    setFundingRounds(startup?.funding_rounds?.toString() || '0');
    setStageOfBusiness(startup?.stage_of_business || '');
    setTeamSize(startup?.team_size?.toString() || '0');
    setRevenueUsd(startup?.revenue_usd?.toString() || '0');
    setConsumerBase(startup?.consumer_base?.toString() || '0');
  }, [startup]);

  // Add refs for each input field
  const nameRef = useRef<TextInput>(null);
  const fundingTotalRef = useRef<TextInput>(null);
  const fundingRoundsRef = useRef<TextInput>(null);
  const teamSizeRef = useRef<TextInput>(null);
  const revenueRef = useRef<TextInput>(null);
  const consumerBaseRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const scrollToInput = (ref: React.RefObject<TextInput | null>) => {
    if (ref.current && keyboardVisible) {
      setTimeout(() => {
        ref.current?.measure((x, y, width, height, pageX, pageY) => {
          scrollViewRef.current?.scrollTo({
            y: pageY - 100,
            animated: true
          });
        });
      }, 100);
    }
  };

  const handleStageSelection = (stage: string) => {
    setStageOfBusiness(stage);
    setShowStageModal(false);
  };

  const handleSubmit = async () => {
    // Validate all fields before submission
    const isNameValid = validateName(name);
    const isFundingValid = validateNumeric(funding_total_usd, 'funding');
    const isRoundsValid = validateNumeric(funding_rounds, 'rounds');
    const isTeamSizeValid = validateNumeric(team_size, 'team');
    const isRevenueValid = validateNumeric(revenue_usd, 'revenue');
    const isConsumerBaseValid = validateNumeric(consumer_base, 'consumer');

    if (!isNameValid || !isFundingValid || !isRoundsValid || !isTeamSizeValid || !isRevenueValid || !isConsumerBaseValid) {
      return;
    }

    if (!startup?.id) {
      console.error('Startup ID is missing');
      return;
    }

    const updatedStartup = {
      ...startup,
      name: name || '',
      funding_total_usd: Number(funding_total_usd) || 0,
      funding_rounds: Number(funding_rounds) || 0,
      continent: startup.continent,
      country: startup.country,
      stage_of_business: stage_of_business || '',
      industry: startup.industry,
      team_size: Number(team_size) || 0,
      revenue_usd: Number(revenue_usd) || 0,
      consumer_base: Number(consumer_base) || 0,
      image: startup.image
    };

    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        console.error('Authentication token not found');
        return;
      }

      const response = await fetch(`${API_IP}/api/startups/${startup.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedStartup),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Startup updated:', data);
        onUpdate(updatedStartup);
        onClose();
      } else {
        const errorText = await response.text();
        console.error('Failed to update startup:', errorText);
      }
    } catch (error) {
      console.error('Error during update:', error);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.modalBackground}>
              <ScrollView 
                ref={scrollViewRef}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={true}
                bounces={true}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.title}>Edit Startup</Text>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Startup Name</Text>
                    <TextInput
                      ref={nameRef}
                      placeholder="Enter startup name"
                      value={name}
                      onChangeText={(text) => {
                        setName(text);
                        validateName(text);
                      }}
                      onFocus={() => scrollToInput(nameRef)}
                      style={[styles.input, nameError ? styles.errorInput : null]}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => {
                        setTimeout(() => {
                          fundingTotalRef.current?.focus();
                        }, 0);
                      }}
                    />
                    {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Total Funding (USD)</Text>
                    <TextInput
                      ref={fundingTotalRef}
                      placeholder="Enter total funding"
                      value={funding_total_usd}
                      onChangeText={(text) => {
                        setFundingTotalUsd(text);
                        validateNumeric(text, 'funding');
                      }}
                      onFocus={() => scrollToInput(fundingTotalRef)}
                      keyboardType="numeric"
                      style={[styles.input, fundingError ? styles.errorInput : null]}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => {
                        setTimeout(() => {
                          fundingRoundsRef.current?.focus();
                        }, 0);
                      }}
                    />
                    {fundingError ? <Text style={styles.errorText}>{fundingError}</Text> : null}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Funding Rounds</Text>
                    <TextInput
                      ref={fundingRoundsRef}
                      placeholder="Enter number of funding rounds"
                      value={funding_rounds}
                      onChangeText={(text) => {
                        setFundingRounds(text);
                        validateNumeric(text, 'rounds');
                      }}
                      onFocus={() => scrollToInput(fundingRoundsRef)}
                      keyboardType="numeric"
                      style={[styles.input, roundsError ? styles.errorInput : null]}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => {
                        setTimeout(() => {
                          teamSizeRef.current?.focus();
                        }, 0);
                      }}
                    />
                    {roundsError ? <Text style={styles.errorText}>{roundsError}</Text> : null}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Stage of Business</Text>
                    <TouchableOpacity 
                      onPress={() => {
                        dismissKeyboard();
                        setShowStageModal(true);
                      }} 
                      style={styles.dropdown}
                    >
                      <Text style={styles.dropdownText}>{stage_of_business || 'Select Stage'}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Stage Modal */}
                  {showStageModal && (
                    <View style={styles.modalOverlay}>
                      <View style={styles.selectionModalContent}>
                        <Text style={styles.modalTitle}>Select Stage of Business</Text>
                        <ScrollView style={styles.selectionScrollView}>
                          {stages.map(stage => (
                            <TouchableOpacity
                              key={stage}
                              style={styles.selectionOption}
                              onPress={() => handleStageSelection(stage)}
                            >
                              <Text style={[
                                styles.selectionOptionText,
                                stage_of_business === stage && styles.selectedOptionText
                              ]}>
                                {stage}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                        <TouchableOpacity 
                          style={styles.closeButton}
                          onPress={() => setShowStageModal(false)}
                        >
                          <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Team Size</Text>
                    <TextInput
                      ref={teamSizeRef}
                      placeholder="Enter team size"
                      value={team_size}
                      onChangeText={(text) => {
                        setTeamSize(text);
                        validateNumeric(text, 'team');
                      }}
                      onFocus={() => scrollToInput(teamSizeRef)}
                      keyboardType="numeric"
                      style={[styles.input, teamSizeError ? styles.errorInput : null]}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => {
                        setTimeout(() => {
                          revenueRef.current?.focus();
                        }, 0);
                      }}
                    />
                    {teamSizeError ? <Text style={styles.errorText}>{teamSizeError}</Text> : null}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Revenue (USD)</Text>
                    <TextInput
                      ref={revenueRef}
                      placeholder="Enter revenue"
                      value={revenue_usd}
                      onChangeText={(text) => {
                        setRevenueUsd(text);
                        validateNumeric(text, 'revenue');
                      }}
                      onFocus={() => scrollToInput(revenueRef)}
                      keyboardType="numeric"
                      style={[styles.input, revenueError ? styles.errorInput : null]}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => {
                        setTimeout(() => {
                          consumerBaseRef.current?.focus();
                        }, 0);
                      }}
                    />
                    {revenueError ? <Text style={styles.errorText}>{revenueError}</Text> : null}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Consumer Base</Text>
                    <TextInput
                      ref={consumerBaseRef}
                      placeholder="Enter consumer base size"
                      value={consumer_base}
                      onChangeText={(text) => {
                        setConsumerBase(text);
                        validateNumeric(text, 'consumer');
                      }}
                      onFocus={() => scrollToInput(consumerBaseRef)}
                      keyboardType="numeric"
                      style={[styles.input, consumerBaseError ? styles.errorInput : null]}
                      returnKeyType="done"
                      onSubmitEditing={dismissKeyboard}
                    />
                    {consumerBaseError ? <Text style={styles.errorText}>{consumerBaseError}</Text> : null}
                  </View>

                  <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.roundButton} onPress={handleSubmit}>
                      <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.roundButton} onPress={onClose}>
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 15,
    maxHeight: '90%',
    zIndex: 2,
    alignSelf: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 26,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1DB954',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    color: '#FFFFFF',
    backgroundColor: '#333333',
    fontSize: 16,
    paddingHorizontal: 15,
    width: '100%',
    zIndex: 1,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#1DB954',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#333333',
    zIndex: 2,
    width: '100%',
  },
  dropdownText: {
    color: '#AAAAAA',
    fontSize: 16,
  },
  selectedItemsText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 5,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 5,
  },
  optionButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    width: '100%',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  optionTextSelected: {
    color: '#1DB954',
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    zIndex: 1,
    width: '100%',
  },
  roundButton: {
    padding: 12,
    borderRadius: 50,
    backgroundColor: '#1DB954',
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 15,
    width: '100%',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  errorInput: {
    borderColor: '#FF4444',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 5,
  },
  selectionModalContent: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    maxHeight: '90%',
    zIndex: 2,
    alignSelf: 'center',
    marginVertical: 20,
  },
  modalTitle: {
    fontSize: 26,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  selectionScrollView: {
    flexGrow: 1,
    marginBottom: 20,
  },
  selectionOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    width: '100%',
  },
  selectionOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  selectedOptionText: {
    color: '#1DB954',
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 12,
    borderRadius: 50,
    backgroundColor: '#1DB954',
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditStartupForm;
