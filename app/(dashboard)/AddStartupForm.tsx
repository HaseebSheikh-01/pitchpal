import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
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
  'Africa': [
    'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cameroon', 'Central African Republic', 'Chad', 'Comoros', 'Congo (Congo-Brazzaville)', 'Democratic Republic of the Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini (fmr. "Swaziland")', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'
  ],
  'Asia': [
    'Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia', 'China', 'Cyprus', 'Georgia', 'India', 'Indonesia', 'Iran', 'Iraq', 'Israel', 'Japan', 'Jordan', 'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Malaysia', 'Maldives', 'Mongolia', 'Myanmar (Burma)', 'Nepal', 'North Korea', 'Oman', 'Pakistan', 'Palestine', 'Philippines', 'Qatar', 'Russia', 'Saudi Arabia', 'Singapore', 'South Korea', 'Sri Lanka', 'Syria', 'Taiwan', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Turkey', 'Turkmenistan', 'United Arab Emirates', 'Uzbekistan', 'Vietnam', 'Yemen'
  ],
  'Europe': [
    'Albania', 'Andorra', 'Armenia', 'Austria', 'Azerbaijan', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia (Czech Republic)', 'Denmark', 'Estonia', 'Finland', 'France', 'Georgia', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kazakhstan', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Turkey', 'Ukraine', 'United Kingdom', 'Vatican City'
  ],
  'North America': [
    'Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Canada', 'Costa Rica', 'Cuba', 'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada', 'Guatemala', 'Haiti', 'Honduras', 'Jamaica', 'Mexico', 'Nicaragua', 'Panama', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Trinidad and Tobago', 'United States'
  ],
  'Oceania': [
    'Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Nauru', 'New Zealand', 'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu'
  ],
  'South America': [
    'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela'
  ]
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
  const [consumer_base, setConsumerBase] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showIndustryModal, setShowIndustryModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [selectedContinent, setSelectedContinent] = useState('');
  const [showCountryModal, setShowCountryModal] = useState(false);

  // Error states
  const [fundingError, setFundingError] = useState('');
  const [roundsError, setRoundsError] = useState('');
  const [teamSizeError, setTeamSizeError] = useState('');
  const [revenueError, setRevenueError] = useState('');
  const [consumerbaseError, setConsumerbaseError] = useState('');

  const validateNumericInput = (value: string, field: string) => {
    if (value === '') {
      return true; // Allow empty field (handled by required validation)
    }
    
    if (!/^\d+$/.test(value)) {
      switch (field) {
        case 'funding':
          setFundingError('Invalid input - must be numeric');
          return false;
        case 'rounds':
          setRoundsError('Invalid input - must be numeric');
          return false;
        case 'team':
          setTeamSizeError('Invalid input - must be numeric');
          return false;
        case 'revenue':
          setRevenueError('Invalid input - must be numeric');
          return false;
        case 'consumer':
          setConsumerbaseError('Invalid input - must be numeric');
          return false;
        default:
          return false;
      }
    }
    
    // Clear any existing errors if validation passes
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
        setConsumerbaseError('');
        break;
    }
    
    return true;
  };

  const handleFundingChange = (text: string) => {
    setFundingTotalUsd(text);
    validateNumericInput(text, 'funding');
  };

  const handleRoundsChange = (text: string) => {
    setFundingRounds(text);
    validateNumericInput(text, 'rounds');
  };

  const handleTeamSizeChange = (text: string) => {
    setTeamSize(text);
    validateNumericInput(text, 'team');
  };

  const handleRevenueChange = (text: string) => {
    setRevenueUsd(text);
    validateNumericInput(text, 'revenue');
  };

  const handleConsumerBaseChange = (text: string) => {
    setConsumerBase(text);
    validateNumericInput(text, 'consumer');
  };

  const handleSubmit = () => {
    // Validate numeric fields first
    const isFundingValid = validateNumericInput(funding_total_usd, 'funding');
    const isRoundsValid = validateNumericInput(funding_rounds, 'rounds');
    const isTeamSizeValid = validateNumericInput(team_size, 'team');
    const isRevenueValid = validateNumericInput(revenue_usd, 'revenue');
    const isConsumerBaseValid = validateNumericInput(consumer_base, 'consumer');
    
    if (!isFundingValid || !isRoundsValid || !isTeamSizeValid || !isRevenueValid || !isConsumerBaseValid) {
      return; // Don't proceed if validation fails
    }

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
      return;
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
      consumer_base: Number(consumer_base),
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
      const { uri } = result.assets[0]; // Get uri from result
      setImage(uri); // Set the photo URI
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          <View style={styles.modalContent}>
            <Text style={styles.title}>Add Startup</Text>

            {/* Startup Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Startup Name</Text>
              <TextInput 
                placeholder="Enter startup name" 
                value={name} 
                onChangeText={setName} 
                style={styles.input} 
                placeholderTextColor="#666666"
              />
            </View>
            
            {/* Total Funding */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Total Funding (USD)</Text>
              <TextInput 
                placeholder="Enter total funding amount" 
                value={funding_total_usd} 
                onChangeText={handleFundingChange} 
                style={[styles.input, fundingError ? styles.errorInput : null]} 
                keyboardType="numeric"
                placeholderTextColor="#666666"
              />
              {fundingError ? <Text style={styles.errorText}>{fundingError}</Text> : null}
            </View>
            
            {/* Funding Rounds */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Number of Funding Rounds</Text>
              <TextInput 
                placeholder="Enter number of funding rounds" 
                value={funding_rounds} 
                onChangeText={handleRoundsChange} 
                style={[styles.input, roundsError ? styles.errorInput : null]} 
                keyboardType="numeric"
                placeholderTextColor="#666666"
              />
              {roundsError ? <Text style={styles.errorText}>{roundsError}</Text> : null}
            </View>
            
            {/* Continent Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Continent</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(true)} style={styles.dropdown}>
                <Text style={styles.dropdownText}>{selectedContinent || 'Select Continent'}</Text>
              </TouchableOpacity>
            </View>

            {/* Continent Selection Modal */}
            <Modal
              visible={showLocationModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowLocationModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.selectionModalContent}>
                  <Text style={styles.modalTitle}>Select Continent</Text>
                  <ScrollView style={styles.selectionScrollView}>
                    {Object.keys(countriesByContinent).map(continent => (
                      <TouchableOpacity
                        key={continent}
                        style={styles.selectionOption}
                        onPress={() => {
                          handleContinentSelection(continent);
                          setShowLocationModal(false);
                        }}
                      >
                        <Text style={[
                          styles.selectionOptionText,
                          selectedContinent === continent && styles.selectedOptionText
                        ]}>
                          {continent}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setShowLocationModal(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Country Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Country</Text>
              <TouchableOpacity
                onPress={() => selectedContinent && setShowCountryModal(true)}
                style={[styles.dropdown, !selectedContinent && { backgroundColor: '#222', borderColor: '#555' }]}
                disabled={!selectedContinent}
              >
                <Text style={[styles.dropdownText, !selectedContinent && { color: '#888' }]}>
                  {country || (!selectedContinent ? 'Select a continent first' : 'Select Country')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Country Selection Modal */}
            <Modal
              visible={showCountryModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowCountryModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.selectionModalContent}>
                  <Text style={styles.modalTitle}>Select Country</Text>
                  <ScrollView style={styles.selectionScrollView}>
                    {(selectedContinent ? countriesByContinent[selectedContinent] : []).map(countryOption => (
                      <TouchableOpacity
                        key={countryOption}
                        style={styles.selectionOption}
                        onPress={() => {
                          setCountry(countryOption);
                          setShowCountryModal(false);
                        }}
                      >
                        <Text style={[
                          styles.selectionOptionText,
                          country === countryOption && styles.selectedOptionText
                        ]}>
                          {countryOption}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setShowCountryModal(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            
            {/* Stage of Business Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Stage of Business</Text>
              <TouchableOpacity onPress={() => setShowStageModal(true)} style={styles.dropdown}>
                <Text style={styles.dropdownText}>{stage_of_business || 'Select Stage'}</Text>
              </TouchableOpacity>
            </View>

            {/* Stage Selection Modal */}
            <Modal
              visible={showStageModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowStageModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.selectionModalContent}>
                  <Text style={styles.modalTitle}>Select Stage of Business</Text>
                  <ScrollView style={styles.selectionScrollView}>
                    {stages.map(stage => (
                      <TouchableOpacity
                        key={stage}
                        style={styles.selectionOption}
                        onPress={() => {
                          handleSelection(stage, 'stage');
                          setShowStageModal(false);
                        }}
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
            </Modal>

            {/* Industry Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Industry</Text>
              <TouchableOpacity onPress={() => setShowIndustryModal(true)} style={styles.dropdown}>
                <Text style={styles.dropdownText}>{industry || 'Select Industry'}</Text>
              </TouchableOpacity>
            </View>

            {/* Industry Selection Modal */}
            <Modal
              visible={showIndustryModal}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowIndustryModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.selectionModalContent}>
                  <Text style={styles.modalTitle}>Select Industry</Text>
                  <ScrollView style={styles.selectionScrollView}>
                    {industries.map(industryOption => (
                      <TouchableOpacity
                        key={industryOption}
                        style={styles.selectionOption}
                        onPress={() => {
                          handleSelection(industryOption, 'industry');
                          setShowIndustryModal(false);
                        }}
                      >
                        <Text style={[
                          styles.selectionOptionText,
                          industry === industryOption && styles.selectedOptionText
                        ]}>
                          {industryOption}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setShowIndustryModal(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Team Size */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Team Size</Text>
              <TextInput 
                placeholder="Enter number of team members" 
                value={team_size} 
                onChangeText={handleTeamSizeChange} 
                style={[styles.input, teamSizeError ? styles.errorInput : null]} 
                keyboardType="numeric"
                placeholderTextColor="#666666"
              />
              {teamSizeError ? <Text style={styles.errorText}>{teamSizeError}</Text> : null}
            </View>
            
            {/* Revenue */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Revenue (USD)</Text>
              <TextInput 
                placeholder="Enter revenue amount" 
                value={revenue_usd} 
                onChangeText={handleRevenueChange} 
                style={[styles.input, revenueError ? styles.errorInput : null]} 
                keyboardType="numeric"
                placeholderTextColor="#666666"
              />
              {revenueError ? <Text style={styles.errorText}>{revenueError}</Text> : null}
            </View>

            {/* Consumer Base */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Consumer Base</Text>
              <TextInput 
                placeholder="Enter number of customers" 
                value={consumer_base} 
                onChangeText={handleConsumerBaseChange} 
                style={[styles.input, consumerbaseError ? styles.errorInput : null]} 
                keyboardType="numeric"
                placeholderTextColor="#666666"
              />
              {consumerbaseError ? <Text style={styles.errorText}>{consumerbaseError}</Text> : null}
            </View>

            {/* Photo Upload */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Startup Logo</Text>
              <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>{image ? 'Change Photo' : 'Upload Photo'}</Text>
              </TouchableOpacity>
              {image && <Image source={{ uri: image }} style={styles.uploadedImage} />}
            </View>

            {/* Action Buttons with Round Corners */}
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingTop: 40,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: '#121212',
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 10,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#1DB954',
    padding: 12,
    borderRadius: 10,
    color: '#FFFFFF',
    backgroundColor: '#333333',
    fontSize: 16,
    paddingHorizontal: 15,
    width: '100%',
  },
  errorInput: {
    borderColor: '#FF6347', // Red border for error
  },
  errorText: {
    color: '#FF6347',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 15,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#1DB954',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#333333',
  },
  dropdownText: {
    fontSize: 16,
    color: '#FFFFFF',
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
  uploadButton: {
    backgroundColor: '#1DB954',
    padding: 15,
    marginTop: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  uploadedImage: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 10,
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
  buttonsContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectionModalContent: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: '#121212',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectionScrollView: {
    maxHeight: '70%',
    marginVertical: 10,
    width: '100%',
  },
  selectionOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    width: '100%',
    alignItems: 'center',
  },
  selectionOptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    width: '100%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    width: '100%',
  },
  closeButton: {
    backgroundColor: '#1DB954',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: '#1DB954',
    fontWeight: 'bold',
  },
});

export default AddStartupForm;