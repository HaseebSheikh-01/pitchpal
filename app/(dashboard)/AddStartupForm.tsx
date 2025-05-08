import React, { useState, useRef, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, SafeAreaView, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // For picking images
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_IP from '../../constants/apiConfig';

interface AddStartupFormProps {
  visible: boolean;
  onClose: () => void;
  onAddStartup: (startup: {
    name: string;
    funding_total_usd: number;
    funding_rounds: number;
    continent: string;
    country: string;
    stage_of_business: string;
    industry: string;
    team_size: number;
    revenue_usd: number;
    consumer_base: number; // New field for consumer base
    image: string | null; // New photo field
  }) => void;
}

// Define countries by continent type
type CountriesByContinent = {
  [key: string]: string[];
};

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Energy', 'Retail', 'Manufacturing', 'Real Estate', 'AI & Machine Learning', 'E-commerce', 'Blockchain', 'Biotech'
];

const stages = [
  'Seed', 'Bootstrap', 'Early Stage', 'Growth Stage', 'Late Stage'
];

const countriesByContinent: CountriesByContinent = {
  'North America': ['USA', 'Canada', 'Mexico'],
  'Europe': ['Germany', 'France', 'Italy', 'Spain', 'UK', 'Poland'],
  'Asia': ['China', 'India', 'Japan', 'South Korea', 'Singapore', 'Thailand'],
  'South America': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru'],
  'Africa': ['Nigeria', 'South Africa', 'Kenya', 'Egypt', 'Morocco', 'Ghana'],
  'Australia': ['Australia']
};

const AddStartupForm: React.FC<AddStartupFormProps> = ({ visible, onClose, onAddStartup }) => {
  const [name, setName] = useState('');
  const [funding_total_usd, setFundingTotalUsd] = useState('');
  const [funding_rounds, setFundingRounds] = useState('');
  const [continent, setContinent] = useState('');
  const [country, setCountry] = useState('');
  const [stage_of_business, setStageOfBusiness] = useState('');
  const [industry, setIndustry] = useState('');
  const [team_size, setTeamSize] = useState('');
  const [revenue_usd, setRevenueUsd] = useState('');
  const [consumer_base, setConsumerBase] = useState(''); // New state for consumer base
  const [image, setImage] = useState<string | null>(null);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showIndustryModal, setShowIndustryModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [selectedContinent, setSelectedContinent] = useState('');

  // Add refs for each input field
  const nameRef = useRef<TextInput>(null);
  const fundingTotalRef = useRef<TextInput>(null);
  const fundingRoundsRef = useRef<TextInput>(null);
  const countryRef = useRef<TextInput>(null);
  const teamSizeRef = useRef<TextInput>(null);
  const revenueRef = useRef<TextInput>(null);
  const consumerBaseRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [windowHeight, setWindowHeight] = useState(Dimensions.get('window').height);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    const dimensionChange = Dimensions.addEventListener('change', ({ window }) => {
      setWindowHeight(window.height);
    });

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
      dimensionChange.remove();
    };
  }, []);

  const scrollToInput = (ref: React.RefObject<TextInput>) => {
    if (ref.current) {
      ref.current.measure((x, y, width, height, pageX, pageY) => {
        const scrollPosition = pageY - (windowHeight * 0.3);
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, scrollPosition),
          animated: true
        });
      });
    }
  };

  const handleSubmit = () => {
    // Basic validation for required fields
    if (!name.trim()) {
      alert('Please enter the startup name.');
      return;
    }
    if (!funding_total_usd.trim()) {
      alert('Please enter the total funding.');
      return;
    }
    if (!funding_rounds.trim()) {
      alert('Please enter the funding rounds.');
      return;
    }
    if (!selectedContinent.trim()) {
      alert('Please select the continent.');
      return;
    }
    if (!country.trim()) {
      alert('Please enter the country.');
      return;
    }
    if (!stage_of_business.trim()) {
      alert('Please select the stage of business.');
      return;
    }
    if (!industry.trim()) {
      alert('Please select the industry.');
      return;
    }
    if (!team_size.trim()) {
      alert('Please enter the team size.');
      return;
    }
    if (!revenue_usd.trim()) {
      alert('Please enter the revenue.');
      return;
    }
    if (!consumer_base.trim()) {
      alert('Please enter the consumer base.');
      return; // Ensure consumer base is filled
    }
    onAddStartup({
      name,
      funding_total_usd: Number(funding_total_usd),
      funding_rounds: Number(funding_rounds),
      continent: selectedContinent,
      country,
      stage_of_business,
      industry,
      team_size: Number(team_size),
      revenue_usd: Number(revenue_usd),
      consumer_base: Number(consumer_base), // Pass consumer base
      image,
    });
    onClose();
  };

  const handleSelection = (item: string, type: 'industry' | 'stage' | 'location') => {
    if (type === 'industry') {
      setIndustry(item);
      setShowIndustryModal(false);
    } else if (type === 'stage') {
      setStageOfBusiness(item);
      setShowStageModal(false);
    } else if (type === 'location') {
      setCountry(item);
      setShowLocationModal(false);
    }
  };

  const handleContinentSelection = (continent: string) => {
    setSelectedContinent(continent);
    setCountry(''); // Reset selected country when continent changes
    setShowLocationModal(false); // Close continent modal
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result && result.assets && result.assets[0]) {
      const { uri } = result.assets[0];
      setImage(uri);
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
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
                bounces={true}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.title}>Add Startup</Text>

                  <View style={styles.formFieldsContainer}>
                    <Text style={styles.fieldLabel}>Startup Name</Text>
                    <TextInput 
                      ref={nameRef}
                      placeholder="Enter startup name" 
                      value={name} 
                      onChangeText={setName} 
                      style={styles.input}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onFocus={() => scrollToInput(nameRef)}
                      onSubmitEditing={() => {
                        setTimeout(() => {
                          fundingTotalRef.current?.focus();
                        }, 0);
                      }}
                    />
                    
                    <Text style={styles.fieldLabel}>Total Funding</Text>
                    <TextInput 
                      ref={fundingTotalRef}
                      placeholder="Enter total funding" 
                      value={funding_total_usd} 
                      onChangeText={setFundingTotalUsd} 
                      style={styles.input}
                      keyboardType="numbers-and-punctuation"
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => {
                        setTimeout(() => {
                          fundingRoundsRef.current?.focus();
                        }, 0);
                      }}
                    />
                    
                    <Text style={styles.fieldLabel}>Funding Rounds</Text>
                    <TextInput 
                      ref={fundingRoundsRef}
                      placeholder="Enter number of funding rounds" 
                      value={funding_rounds} 
                      onChangeText={setFundingRounds} 
                      style={styles.input}
                      keyboardType="numbers-and-punctuation"
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => {
                        setTimeout(() => {
                          countryRef.current?.focus();
                        }, 0);
                      }}
                    />
                    
                    <Text style={styles.fieldLabel}>Continent</Text>
                    <TouchableOpacity onPress={() => setShowLocationModal(true)} style={styles.dropdown}>
                      <Text style={styles.dropdownText}>Select Continent</Text>
                      <Text style={styles.selectedItemsText}>{selectedContinent || 'None Selected'}</Text>
                    </TouchableOpacity>

                    {/* Continent Modal */}
                    {showLocationModal && (
                      <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                          <Text style={styles.title}>Select Continent</Text>
                          {Object.keys(countriesByContinent).map(continent => (
                            <TouchableOpacity
                              key={continent}
                              style={styles.optionButton}
                              onPress={() => handleContinentSelection(continent)}
                            >
                              <Text style={[styles.optionText, selectedContinent === continent && styles.optionTextSelected]}>{continent}</Text>
                            </TouchableOpacity>
                          ))}
                          <Button title="Close" onPress={() => setShowLocationModal(false)} color="#FF6347" />
                        </View>
                      </View>
                    )}

                    <Text style={styles.fieldLabel}>Country</Text>
                    <TextInput 
                      ref={countryRef}
                      placeholder="Enter country name" 
                      value={country} 
                      onChangeText={setCountry} 
                      style={styles.input}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => {
                        setTimeout(() => {
                          teamSizeRef.current?.focus();
                        }, 0);
                      }}
                    />
                    
                    <Text style={styles.fieldLabel}>Stage of Business</Text>
                    <TouchableOpacity onPress={() => {
                      dismissKeyboard();
                      setShowStageModal(true);
                    }} style={styles.dropdown}>
                      <Text style={styles.dropdownText}>Select Stage of Business</Text>
                      <Text style={styles.selectedItemsText}>{stage_of_business || 'None Selected'}</Text>
                    </TouchableOpacity>

                    {/* Stage Modal */}
                    {showStageModal && (
                      <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                          <Text style={styles.title}>Select Stage of Business</Text>
                          {stages.map(stage => (
                            <TouchableOpacity
                              key={stage}
                              style={styles.optionButton}
                              onPress={() => handleSelection(stage, 'stage')}
                            >
                              <Text style={[styles.optionText, stage_of_business === stage && styles.optionTextSelected]}>{stage}</Text>
                            </TouchableOpacity>
                          ))}
                          <Button title="Close" onPress={() => setShowStageModal(false)} color="#FF6347" />
                        </View>
                      </View>
                    )}

                    <Text style={styles.fieldLabel}>Industry</Text>
                    <TouchableOpacity onPress={() => setShowIndustryModal(true)} style={styles.dropdown}>
                      <Text style={styles.dropdownText}>Select Industry</Text>
                      <Text style={styles.selectedItemsText}>{industry || 'None Selected'}</Text>
                    </TouchableOpacity>

                    {/* Industry Modal */}
                    {showIndustryModal && (
                      <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                          <Text style={styles.title}>Select Industry</Text>
                          {industries.map(industryOption => (
                            <TouchableOpacity
                              key={industryOption}
                              style={styles.optionButton}
                              onPress={() => handleSelection(industryOption, 'industry')}
                            >
                              <Text style={[styles.optionText, industry === industryOption && styles.optionTextSelected]}>{industryOption}</Text>
                            </TouchableOpacity>
                          ))}
                          <Button title="Close" onPress={() => setShowIndustryModal(false)} color="#FF6347" />
                        </View>
                      </View>
                    )}

                    <Text style={styles.fieldLabel}>Team Size</Text>
                    <TextInput 
                      ref={teamSizeRef}
                      placeholder="Enter team size" 
                      value={team_size} 
                      onChangeText={setTeamSize} 
                      style={styles.input}
                      keyboardType="numbers-and-punctuation"
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => {
                        setTimeout(() => {
                          revenueRef.current?.focus();
                        }, 0);
                      }}
                    />
                    
                    <Text style={styles.fieldLabel}>Revenue</Text>
                    <TextInput 
                      ref={revenueRef}
                      placeholder="Enter revenue in USD" 
                      value={revenue_usd} 
                      onChangeText={setRevenueUsd} 
                      style={styles.input}
                      keyboardType="numbers-and-punctuation"
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => {
                        setTimeout(() => {
                          consumerBaseRef.current?.focus();
                        }, 0);
                      }}
                    />

                    <Text style={styles.fieldLabel}>Consumer Base</Text>
                    <TextInput 
                      ref={consumerBaseRef}
                      placeholder="Enter number of customers" 
                      value={consumer_base} 
                      onChangeText={setConsumerBase} 
                      style={styles.input}
                      keyboardType="numbers-and-punctuation"
                      returnKeyType="next"
                      onFocus={() => scrollToInput(consumerBaseRef)}
                      onSubmitEditing={() => {
                        setTimeout(() => {
                          dismissKeyboard();
                        }, 0);
                      }}
                    />
                  </View>

                  <View style={styles.uploadSection}>
                    <Text style={styles.fieldLabel}>Photo</Text>
                    <TouchableOpacity 
                      onPress={() => {
                        dismissKeyboard();
                        pickImage();
                      }} 
                      style={styles.uploadButton}
                    >
                      <Text style={styles.uploadButtonText}>Upload Photo</Text>
                    </TouchableOpacity>
                    {image && (
                      <View style={styles.imageContainer}>
                        <Image source={{ uri: image }} style={styles.uploadedImage} />
                      </View>
                    )}
                  </View>

                  <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.roundButton} onPress={handleSubmit}>
                      <Text style={styles.buttonText}>Submit</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: '#121212',
    borderRadius: 15,
    marginHorizontal: 20,
    alignSelf: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#1DB954',
    marginBottom: 15,
    padding: 12,
    borderRadius: 10,
    color: '#FFFFFF',
    backgroundColor: '#333333',
    fontSize: 16,
    paddingHorizontal: 15,
    width: '100%',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#1DB954',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    justifyContent: 'center',
    backgroundColor: '#333333',
    zIndex: 2,
    width: '100%',
  },
  dropdownText: {
    fontSize: 16,
    color: '#AAAAAA',
  },
  selectedItemsText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 5,
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
  formFieldsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  uploadSection: {
    marginTop: 20,
    marginBottom: 20,
    width: '100%',
  },
  imageContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  uploadButton: {
    backgroundColor: '#1DB954',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    marginBottom: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 9999,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1DB954',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  optionTextSelected: {
    fontWeight: 'bold',
    color: '#1DB954',
  },
});


export default AddStartupForm;
