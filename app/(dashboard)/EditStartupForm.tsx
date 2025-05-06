import React, { useState } from 'react';
import { Modal, TextInput, TouchableOpacity, View, Text, StyleSheet } from 'react-native';

interface Startup {
  id: string;
  name: string;
  funding_total_usd: number;
  funding_rounds: number;
  stage_of_business: string;
  team_size: number;
  revenue_usd: number;
  image: string | null;
}

interface EditStartupFormProps {
  visible: boolean;
  onClose: () => void;
  startup: Startup;
}

const EditStartupForm: React.FC<EditStartupFormProps> = ({ visible, onClose, startup }) => {
  const [name, setName] = useState(startup.name);
  const [funding_total_usd, setFundingTotalUsd] = useState(startup.funding_total_usd.toString());
  const [funding_rounds, setFundingRounds] = useState(startup.funding_rounds.toString());
  const [stage_of_business, setStageOfBusiness] = useState(startup.stage_of_business);
  const [team_size, setTeamSize] = useState(startup.team_size.toString());
  const [revenue_usd, setRevenueUsd] = useState(startup.revenue_usd.toString());

  const handleSubmit = async () => {
    const updatedStartup = {
      ...startup,
      name,
      funding_total_usd: Number(funding_total_usd),
      funding_rounds: Number(funding_rounds),
      stage_of_business,
      team_size: Number(team_size),
      revenue_usd: Number(revenue_usd),
    };

    try {
      // Replace with your API endpoint and method for updating startup
      const response = await fetch('https://your-api-endpoint.com/update-startup', {
        method: 'PUT', // or 'POST' depending on your API
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedStartup),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Startup updated:', data);
        onClose();  // Close the form on successful update
      } else {
        console.error('Failed to update startup');
      }
    } catch (error) {
      console.error('Error during update:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Edit Startup</Text>

          <TextInput
            placeholder="Startup Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            placeholder="Total Funding"
            value={funding_total_usd}
            onChangeText={setFundingTotalUsd}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="Funding Rounds"
            value={funding_rounds}
            onChangeText={setFundingRounds}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="Stage of Business"
            value={stage_of_business}
            onChangeText={setStageOfBusiness}
            style={styles.input}
          />
          <TextInput
            placeholder="Team Size"
            value={team_size}
            onChangeText={setTeamSize}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="Revenue in USD"
            value={revenue_usd}
            onChangeText={setRevenueUsd}
            keyboardType="numeric"
            style={styles.input}
          />

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.roundButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.roundButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 15,
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
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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
});

export default EditStartupForm;
