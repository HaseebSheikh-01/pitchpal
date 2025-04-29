import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // For picking images

// Define the props type for AddStartupForm
interface AddStartupFormProps {
  visible: boolean;
  onClose: () => void;
  onAddStartup: (startup: {
    name: string;
    category: string;
    totalFunding: string;
    fundingRounds: string;
    locationCity: string;
    locationCountry: string;
    foundedDate: string;
    teamSize: string;
    revenue: string;
    stageOfBusiness: string;
    industry: string;
    minInvestment: string;
    maxInvestment: string;
    photo: string | null; // New photo field
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
  const [startupName, setStartupName] = useState('');
  const [category, setCategory] = useState('');
  const [totalFunding, setTotalFunding] = useState('');
  const [fundingRounds, setFundingRounds] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [locationCountry, setLocationCountry] = useState('');
  const [foundedDate, setFoundedDate] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [revenue, setRevenue] = useState('');
  const [industry, setIndustry] = useState('');
  const [stageOfBusiness, setStageOfBusiness] = useState('');
  const [minInvestment, setMinInvestment] = useState(1000);
  const [maxInvestment, setMaxInvestment] = useState(1000000);
  const [selectedContinent, setSelectedContinent] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showIndustryModal, setShowIndustryModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null); // New state for photo

  const handleSubmit = () => {
    onAddStartup({
      name: startupName,
      category,
      totalFunding,
      fundingRounds,
      locationCity,
      locationCountry,
      foundedDate,
      teamSize,
      revenue,
      stageOfBusiness,
      industry,
      minInvestment: minInvestment.toString(),
      maxInvestment: maxInvestment.toString(),
      photo,
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
      setLocationCity(item);
      setShowLocationModal(false);
    }
  };

  const handleContinentSelection = (continent: string) => {
    setSelectedContinent(continent);
    setLocationCountry(''); // Reset selected country when continent changes
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
      setPhoto(uri); // Set the photo URI
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
            value={startupName} 
            onChangeText={setStartupName} 
            style={styles.input} 
          />
          
          {/* Total Funding */}
          <TextInput 
            placeholder="Total Funding" 
            value={totalFunding} 
            onChangeText={setTotalFunding} 
            style={styles.input} 
          />
          
          {/* Funding Rounds */}
          <TextInput 
            placeholder="Funding Rounds" 
            value={fundingRounds} 
            onChangeText={setFundingRounds} 
            style={styles.input} 
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
            value={locationCountry} 
            onChangeText={setLocationCountry} 
            style={styles.input} 
          />
          
          {/* Stage of Business Dropdown */}
          <TouchableOpacity onPress={() => setShowStageModal(true)} style={styles.dropdown}>
            <Text style={styles.dropdownText}>Select Stage of Business</Text>
            <Text style={styles.selectedItemsText}>{stageOfBusiness || 'None Selected'}</Text>
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
                    <Text style={[styles.optionText, stageOfBusiness === stage && styles.optionTextSelected]}>
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
            value={teamSize} 
            onChangeText={setTeamSize} 
            style={styles.input} 
          />
          
          {/* Revenue */}
          <TextInput 
            placeholder="Revenue in $USD" 
            value={revenue} 
            onChangeText={setRevenue} 
            style={styles.input} 
          />
          
          {/* Photo Upload */}
          <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Upload Photo</Text>
          </TouchableOpacity>
          {photo && <Image source={{ uri: photo }} style={styles.uploadedImage} />}

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
