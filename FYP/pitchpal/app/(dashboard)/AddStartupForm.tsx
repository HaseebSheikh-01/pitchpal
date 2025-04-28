import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

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
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)', // Updated shadow
    elevation: 8,
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
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#333333',
    borderRadius: 10,
    color: '#FFFFFF',
    fontSize: 16,
  },
  dropdownText: {
    color: '#1DB954',
    fontSize: 16,
  },
  selectedItemsText: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 5,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 20,
    elevation: 8,
  },
  optionButton: {
    backgroundColor: '#1E1E1E',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  optionTextSelected: {
    color: '#1DB954',
    fontWeight: 'bold',
  },
  roundButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default AddStartupForm;
