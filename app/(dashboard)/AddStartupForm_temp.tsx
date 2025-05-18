import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';

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
    firstFundingDate: string;
    lastFundingDate: string;
    teamSize: string;
    revenue: string;
    stageOfBusiness: string;
    industry: string;
  }) => void;
}

const AddStartupForm: React.FC<AddStartupFormProps> = ({ visible, onClose, onAddStartup }) => {
  const [startupName, setStartupName] = useState('');
  const [category, setCategory] = useState('');
  const [totalFunding, setTotalFunding] = useState('');
  const [fundingRounds, setFundingRounds] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [locationCountry, setLocationCountry] = useState('');
  const [foundedDate, setFoundedDate] = useState('');
  const [firstFundingDate, setFirstFundingDate] = useState('');
  const [lastFundingDate, setLastFundingDate] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [revenue, setRevenue] = useState('');
  const [stageOfBusiness, setStageOfBusiness] = useState('');
  const [industry, setIndustry] = useState('');

  const handleSubmit = () => {
    // Send the form data to the parent (StartupDashboard)
    onAddStartup({
      name: startupName,
      category,
      totalFunding,
      fundingRounds,
      locationCity,
      locationCountry,
      foundedDate,
      firstFundingDate,
      lastFundingDate,
      teamSize,
      revenue,
      stageOfBusiness,
      industry,
    });
    onClose(); // Close the modal after submitting the form
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Add Startup</Text>
        <TextInput placeholder="Startup Name" value={startupName} onChangeText={setStartupName} style={styles.input} />
        <TextInput placeholder="Category" value={category} onChangeText={setCategory} style={styles.input} />
        <TextInput placeholder="Total Funding" value={totalFunding} onChangeText={setTotalFunding} style={styles.input} />
        <TextInput placeholder="Funding Rounds" value={fundingRounds} onChangeText={setFundingRounds} style={styles.input} />
        <TextInput placeholder="Location (City)" value={locationCity} onChangeText={setLocationCity} style={styles.input} />
        <TextInput placeholder="Location (Country)" value={locationCountry} onChangeText={setLocationCountry} style={styles.input} />
        <TextInput placeholder="Founded Date" value={foundedDate} onChangeText={setFoundedDate} style={styles.input} />
        <TextInput placeholder="First Funding Date" value={firstFundingDate} onChangeText={setFirstFundingDate} style={styles.input} />
        <TextInput placeholder="Last Funding Date" value={lastFundingDate} onChangeText={setLastFundingDate} style={styles.input} />
        <TextInput placeholder="Team Size" value={teamSize} onChangeText={setTeamSize} style={styles.input} />
        <TextInput placeholder="Revenue" value={revenue} onChangeText={setRevenue} style={styles.input} />
        <TextInput placeholder="Stage of Business" value={stageOfBusiness} onChangeText={setStageOfBusiness} style={styles.input} />
        <TextInput placeholder="Industry" value={industry} onChangeText={setIndustry} style={styles.input} />
        <Button title="Submit" onPress={handleSubmit} color="#4CAF50" />
        <Button title="Cancel" onPress={onClose} color="#4CAF50" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    backgroundColor: '#121212', 
    borderRadius: 10, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 4, 
    elevation: 5 
  },
  title: { 
    fontSize: 24, 
    marginBottom: 20, 
    color: '#FFFFFF', 
    textAlign: 'center' 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#1DB954', 
    marginBottom: 10, 
    padding: 10, 
    borderRadius: 5, 
    color: '#FFFFFF', 
    backgroundColor: '#3A3A3A' 
  },
});

export default AddStartupForm;
