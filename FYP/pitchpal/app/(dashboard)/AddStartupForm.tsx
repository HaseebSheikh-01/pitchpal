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
    image: string | null; // New photo field
  }) => void;
}

// Define countries by continent type
type CountriesByContinent = {
  [key: string]: string[]; // key is the continent, value is an array of country names
};

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Energy', 'Retail', 'Manufacturing', 'Real Estate', 'AI & Machine Learning', 'E-commerce', 'Blockchain', 'Biotech'
];

const stages = [
  'Seed', 'Bootstrap', 'Early Stage', 'Growth Stage', 'Late Stage'
];

// Hardcoded country data for each continent (you can replace this with an API call if needed)
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
  const [image, setImage] = useState<string | null>(null);

  // Add missing modal and selection states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showIndustryModal, setShowIndustryModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [selectedContinent, setSelectedContinent] = useState('');

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

    // Fix for "cancelled" property and "uri" property type checking
    if (result && result.assets && result.assets[0]) {
      const { uri } = result.assets[0]; // Get uri from result
      setImage(uri); // Set the photo URI
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Add Startup</Text>

          {/* Startup Name */}
          <TextInput 
            placeholder="Startup Name" 
            value={name} 
            onChangeText={setName} 
            style={styles.input} 
          />
          
          {/* Total Funding */}
          <TextInput 
            placeholder="Total Funding" 
            value={funding_total_usd} 
            onChangeText={setFundingTotalUsd} 
            style={styles.input} 
            keyboardType="numeric"
          />
          
          {/* Funding Rounds */}
          <TextInput 
            placeholder="Funding Rounds" 
            value={funding_rounds} 
            onChangeText={setFundingRounds} 
            style={styles.input} 
            keyboardType="numeric"
          />
          
          {/* Continent Dropdown */}
          <TouchableOpacity onPress={() => setShowLocationModal(true)} style={styles.dropdown}>
            <Text style={styles.dropdownText}>Select Continent</Text>
            <Text style={styles.selectedItemsText}>{selectedContinent || 'None Selected'}</Text>
          </TouchableOpacity>

          {/* Continent Modal */}
          {showLocationModal && (
            <View style={styles.modal}>
              <View style={styles.modalContent}>
                <Text style={styles.title}>Select Continent</Text>
                {Object.keys(countriesByContinent).map(continent => (
                  <TouchableOpacity
                    key={continent}
                    style={styles.optionButton}
                    onPress={() => handleContinentSelection(continent)}
                  >
                    <Text style={[styles.optionText, selectedContinent === continent && styles.optionTextSelected]}>
                      {continent}
                    </Text>
                  </TouchableOpacity>
                ))}
                <Button title="Close" onPress={() => setShowLocationModal(false)} color="#FF6347" />
              </View>
            </View>
          )}

          {/* Country Text Input (User Enters Manually) */}
          <TextInput 
            placeholder="Enter Country Name" 
            value={country} 
            onChangeText={setCountry} 
            style={styles.input} 
          />
          
          {/* Stage of Business Dropdown */}
          <TouchableOpacity onPress={() => setShowStageModal(true)} style={styles.dropdown}>
            <Text style={styles.dropdownText}>Select Stage of Business</Text>
            <Text style={styles.selectedItemsText}>{stage_of_business || 'None Selected'}</Text>
          </TouchableOpacity>

          {/* Stage Modal */}
          {showStageModal && (
            <View style={styles.modal}>
              <View style={styles.modalContent}>
                <Text style={styles.title}>Select Stage of Business</Text>
                {stages.map(stage => (
                  <TouchableOpacity
                    key={stage}
                    style={styles.optionButton}
                    onPress={() => handleSelection(stage, 'stage')}
                  >
                    <Text style={[styles.optionText, stage_of_business === stage && styles.optionTextSelected]}>
                      {stage}
                    </Text>
                  </TouchableOpacity>
                ))}
                <Button title="Close" onPress={() => setShowStageModal(false)} color="#FF6347" />
              </View>
            </View>
          )}

          {/* Industry Dropdown */}
          <TouchableOpacity onPress={() => setShowIndustryModal(true)} style={styles.dropdown}>
            <Text style={styles.dropdownText}>Select Industry</Text>
            <Text style={styles.selectedItemsText}>{industry || 'None Selected'}</Text>
          </TouchableOpacity>

          {/* Industry Modal */}
          {showIndustryModal && (
            <View style={styles.modal}>
              <View style={styles.modalContent}>
                <Text style={styles.title}>Select Industry</Text>
                {industries.map(industryOption => (
                  <TouchableOpacity
                    key={industryOption}
                    style={styles.optionButton}
                    onPress={() => handleSelection(industryOption, 'industry')}
                  >
                    <Text style={[styles.optionText, industry === industryOption && styles.optionTextSelected]}>
                      {industryOption}
                    </Text>
                  </TouchableOpacity>
                ))}
                <Button title="Close" onPress={() => setShowIndustryModal(false)} color="#FF6347" />
              </View>
            </View>
          )}

          {/* Team Size */}
          <TextInput 
            placeholder="Team Size" 
            value={team_size} 
            onChangeText={setTeamSize} 
            style={styles.input} 
            keyboardType="numeric"
          />
          
          {/* Revenue */}
          <TextInput 
            placeholder="Revenue in $USD" 
            value={revenue_usd} 
            onChangeText={setRevenueUsd} 
            style={styles.input} 
            keyboardType="numeric"
          />
          
          {/* Photo Upload */}
          <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Upload Photo</Text>
          </TouchableOpacity>
          {image && <Image source={{ uri: image }} style={styles.uploadedImage} />}

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
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: '#121212',
    borderRadius: 15,
    marginHorizontal: 20
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20
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
  buttonsContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#1DB954',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    justifyContent: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#FFFFFF',
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
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
