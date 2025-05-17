import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Platform } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Milestone {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed';
  parts: { name: string; completed: boolean }[];
}

const statusColors = {
  'Not Started': '#FF4444',
  'In Progress': '#FFBB33',
  'Completed': '#00C851',
};

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr; // fallback to raw if invalid
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const days: string[] = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const months: string[] = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const years: string[] = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() + i).toString());

const ProgressTracker: React.FC = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [filter, setFilter] = useState<'All' | 'Upcoming' | 'In Progress' | 'Completed'>('All');
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({
    name: '',
    startDate: '',
    endDate: '',
    priority: 'Medium',
    status: 'Not Started',
    parts: [],
  });

  // Dropdown state for modal
  const [showStartDayModal, setShowStartDayModal] = useState(false);
  const [showStartMonthModal, setShowStartMonthModal] = useState(false);
  const [showStartYearModal, setShowStartYearModal] = useState(false);
  const [showEndDayModal, setShowEndDayModal] = useState(false);
  const [showEndMonthModal, setShowEndMonthModal] = useState(false);
  const [showEndYearModal, setShowEndYearModal] = useState(false);
  const [startDay, setStartDay] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endDay, setEndDay] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [endYear, setEndYear] = useState('');

  // Load milestones from AsyncStorage on mount
  useEffect(() => {
    const loadMilestones = async () => {
      try {
        const stored = await AsyncStorage.getItem('milestones');
        if (stored) {
          const parsed = JSON.parse(stored).map((m: any) => ({ ...m, parts: Array.isArray(m.parts) ? m.parts : [] }));
          setMilestones(parsed);
        }
      } catch (e) { console.error('Failed to load milestones', e); }
    };
    loadMilestones();
  }, []);

  // Save milestones to AsyncStorage whenever they change
  useEffect(() => {
    AsyncStorage.setItem('milestones', JSON.stringify(milestones)).catch(e => console.error('Failed to save milestones', e));
  }, [milestones]);

  const getCurrentDate = () => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Helper to get date string from dropdowns
  const getDropdownDate = (day: string, month: string, year: string) => {
    if (day && month && year) {
      const monthIndex = months.indexOf(month);
      if (monthIndex !== -1) {
        const d = new Date(Number(year), monthIndex, Number(day));
        return d.toISOString().slice(0, 10); // YYYY-MM-DD
      }
    }
    return '';
  };

  // Calculate progress based on completed parts
  const getProgress = (milestone: Milestone) => {
    if (!milestone.parts || milestone.parts.length === 0) return 0;
    const completed = milestone.parts.filter(p => p.completed).length;
    return Math.round((completed / milestone.parts.length) * 100);
  };

  // Filter logic: show correct milestones in each tab
  const filteredMilestones = milestones.filter(m => {
    if (filter === 'All') return true;
    if (filter === 'Upcoming') return m.status === 'Not Started';
    if (filter === 'In Progress') return m.status === 'In Progress';
    if (filter === 'Completed') return m.status === 'Completed';
    return false;
  });

  // On modal open, reset dropdowns
  const openModal = (milestone?: Milestone) => {
    setModalVisible(true);
    if (milestone) {
      setEditingMilestone(milestone);
      setNewMilestone(milestone);
      // Parse start and end dates to dropdowns
      const [sy, sm, sd] = milestone.startDate ? milestone.startDate.split('-') : ['', '', ''];
      const [ey, em, ed] = milestone.endDate ? milestone.endDate.split('-') : ['', '', ''];
      setStartYear(sy);
      setStartMonth(months[Number(sm) - 1] || '');
      setStartDay(sd);
      setEndYear(ey);
      setEndMonth(months[Number(em) - 1] || '');
      setEndDay(ed);
    } else {
      setEditingMilestone(null);
      setNewMilestone({ name: '', startDate: '', endDate: '', priority: 'Medium', status: 'Not Started', parts: [] });
      setStartDay(''); setStartMonth(''); setStartYear('');
      setEndDay(''); setEndMonth(''); setEndYear('');
    }
  };

  // When saving, always build start/end dates from dropdowns
  const handleSaveMilestone = () => {
    const startDate = getDropdownDate(startDay, startMonth, startYear);
    const endDate = getDropdownDate(endDay, endMonth, endYear);
    if (!newMilestone.name || !startDate || !endDate) return;
    if (editingMilestone) {
      setMilestones(milestones.map(m => m.id === editingMilestone.id ? { ...editingMilestone, ...newMilestone, startDate, endDate, parts: newMilestone.parts || [] } as Milestone : m));
    } else {
      setMilestones([
        ...milestones,
        {
          id: Date.now().toString(),
          name: newMilestone.name!,
          startDate,
          endDate,
          priority: newMilestone.priority as 'High' | 'Medium' | 'Low',
          status: newMilestone.status as 'Not Started' | 'In Progress' | 'Completed',
          parts: newMilestone.parts || [],
        },
      ]);
    }
    setModalVisible(false);
    setEditingMilestone(null);
    setNewMilestone({ name: '', startDate: '', endDate: '', priority: 'Medium', status: 'Not Started', parts: [] });
    setStartDay(''); setStartMonth(''); setStartYear('');
    setEndDay(''); setEndMonth(''); setEndYear('');
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setNewMilestone(milestone);
    setModalVisible(true);
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const handleClearCompleted = () => {
    setMilestones(milestones.filter(m => m.status !== 'Completed'));
  };

  // When all parts are checked, set status to Completed
  useEffect(() => {
    setMilestones(milestones => milestones.map(m => {
      const progress = getProgress(m);
      if (progress === 100 && m.status !== 'Completed') {
        return { ...m, status: 'Completed' };
      } else if (progress < 100 && m.status === 'Completed') {
        return { ...m, status: 'In Progress' };
      }
      return m;
    }));
  }, [milestones.length, milestones.map(m => m.parts.map(p => p.completed).join(',')).join('|')]);

  // Add/remove parts in modal
  const addPart = () => setNewMilestone({ ...newMilestone, parts: [...(newMilestone.parts || []), { name: '', completed: false }] });
  const removePart = (idx: number) => setNewMilestone({ ...newMilestone, parts: (newMilestone.parts || []).filter((_, i) => i !== idx) });
  const updatePartName = (idx: number, name: string) => setNewMilestone({ ...newMilestone, parts: (newMilestone.parts || []).map((p, i) => i === idx ? { ...p, name } : p) });
  const togglePartCompleted = (milestone: Milestone, idx: number) => {
    setMilestones(milestones.map(m => m.id === milestone.id ? { ...m, parts: m.parts.map((p, i) => i === idx ? { ...p, completed: !p.completed } : p) } : m));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setFilter('All')} style={styles.homeButton}>
          <MaterialIcons name="home" size={28} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.title}>Progress Tracker</Text>
        <Text style={styles.date}>{getCurrentDate()}</Text>
      </View>

      {/* Instructions as UI cues */}
      <View style={styles.instructionBox}>
        <Ionicons name="information-circle-outline" size={20} color="#4CAF50" style={{ marginRight: 6 }} />
        <Text style={styles.instructionText}>Tap <MaterialIcons name="add" size={18} color="#4CAF50" /> to add a milestone. Tap <MaterialIcons name="edit" size={18} color="#FFBB33" /> or <MaterialIcons name="delete" size={18} color="#FF4444" /> to edit or delete. Use tabs to filter. Dates: <Text style={{fontWeight:'bold'}}>YYYY-MM-DD</Text>.</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {(['All', 'Upcoming', 'In Progress', 'Completed'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, filter === tab && styles.selectedFilterTab]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.filterTabText, filter === tab && styles.selectedFilterTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Milestone List */}
      <ScrollView style={styles.list}>
        {filteredMilestones.map(milestone => (
          <View key={milestone.id} style={styles.milestoneItem}>
            <View style={[styles.statusDot, { backgroundColor: statusColors[milestone.status] }]} />
            <View style={styles.milestoneInfo}>
              <Text style={styles.milestoneName}>{milestone.name}</Text>
              <Text style={styles.milestoneDates}>Start: {formatDate(milestone.startDate)} | End: {formatDate(milestone.endDate)}</Text>
              <Text style={styles.milestoneMeta}>{milestone.priority} | {milestone.status}</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBar, { width: `${getProgress(milestone)}%`, backgroundColor: statusColors[milestone.status] }]} />
              </View>
              <Text style={styles.progressText}>{getProgress(milestone)}%</Text>
              {/* Parts checklist */}
              {Array.isArray(milestone.parts) && milestone.parts.length > 0 && (
                <View style={styles.partsList}>
                  {milestone.parts.map((part, idx) => (
                    <TouchableOpacity key={idx} style={styles.partItem} onPress={() => togglePartCompleted(milestone, idx)}>
                      <MaterialIcons name={part.completed ? 'check-box' : 'check-box-outline-blank'} size={18} color={part.completed ? '#4CAF50' : '#888'} />
                      <Text style={[styles.partText, part.completed && { textDecorationLine: 'line-through', color: '#888' }]}>{part.name || `Part ${idx + 1}`}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <View style={styles.milestoneActions}>
              <TouchableOpacity onPress={() => openModal(milestone)}>
                <MaterialIcons name="edit" size={22} color="#FFBB33" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteMilestone(milestone.id)}>
                <MaterialIcons name="delete" size={22} color="#FF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, milestones.some(m => m.status === 'Completed') && { bottom: 90 }]}
        onPress={() => openModal()}
      >
        <MaterialIcons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Clear Completed Button */}
      {milestones.some(m => m.status === 'Completed') && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClearCompleted}>
          <Text style={styles.clearButtonText}>Clear Completed Tasks</Text>
        </TouchableOpacity>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingMilestone ? 'Edit Task/Milestone' : 'Add New Task/Milestone'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Task/Milestone Name"
              placeholderTextColor="#666"
              value={newMilestone.name}
              onChangeText={text => setNewMilestone({ ...newMilestone, name: text })}
            />
            {/* Start Date Dropdowns */}
            <View style={styles.dateDropdownRow}>
              <TouchableOpacity style={styles.dropdown} onPress={() => setShowStartDayModal(true)}>
                <Text style={styles.dropdownText}>{startDay || 'Day'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdown} onPress={() => setShowStartMonthModal(true)}>
                <Text style={styles.dropdownText}>{startMonth || 'Month'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdown} onPress={() => setShowStartYearModal(true)}>
                <Text style={styles.dropdownText}>{startYear || 'Year'}</Text>
              </TouchableOpacity>
            </View>
            {/* Modals for start date */}
            <Modal visible={showStartDayModal} transparent animationType="fade">
              <View style={styles.pickerModalOverlay}>
                <View style={styles.pickerModalContent}>
                  <ScrollView>{days.map((day: string) => (
                    <TouchableOpacity key={day} onPress={() => { setStartDay(day); setShowStartDayModal(false); }}>
                      <Text style={styles.pickerOption}>{day}</Text>
                    </TouchableOpacity>
                  ))}</ScrollView>
                </View>
              </View>
            </Modal>
            <Modal visible={showStartMonthModal} transparent animationType="fade">
              <View style={styles.pickerModalOverlay}>
                <View style={styles.pickerModalContent}>
                  <ScrollView>{months.map((month: string) => (
                    <TouchableOpacity key={month} onPress={() => { setStartMonth(month); setShowStartMonthModal(false); }}>
                      <Text style={styles.pickerOption}>{month}</Text>
                    </TouchableOpacity>
                  ))}</ScrollView>
                </View>
              </View>
            </Modal>
            <Modal visible={showStartYearModal} transparent animationType="fade">
              <View style={styles.pickerModalOverlay}>
                <View style={styles.pickerModalContent}>
                  <ScrollView>{years.map((year: string) => (
                    <TouchableOpacity key={year} onPress={() => { setStartYear(year); setShowStartYearModal(false); }}>
                      <Text style={styles.pickerOption}>{year}</Text>
                    </TouchableOpacity>
                  ))}</ScrollView>
                </View>
              </View>
            </Modal>
            <Text style={styles.helperText}>e.g. 2025-05-17</Text>
            {/* End Date Dropdowns */}
            <View style={styles.dateDropdownRow}>
              <TouchableOpacity style={styles.dropdown} onPress={() => setShowEndDayModal(true)}>
                <Text style={styles.dropdownText}>{endDay || 'Day'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdown} onPress={() => setShowEndMonthModal(true)}>
                <Text style={styles.dropdownText}>{endMonth || 'Month'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdown} onPress={() => setShowEndYearModal(true)}>
                <Text style={styles.dropdownText}>{endYear || 'Year'}</Text>
              </TouchableOpacity>
            </View>
            {/* Modals for end date */}
            <Modal visible={showEndDayModal} transparent animationType="fade">
              <View style={styles.pickerModalOverlay}>
                <View style={styles.pickerModalContent}>
                  <ScrollView>{days.map((day: string) => (
                    <TouchableOpacity key={day} onPress={() => { setEndDay(day); setShowEndDayModal(false); }}>
                      <Text style={styles.pickerOption}>{day}</Text>
                    </TouchableOpacity>
                  ))}</ScrollView>
                </View>
              </View>
            </Modal>
            <Modal visible={showEndMonthModal} transparent animationType="fade">
              <View style={styles.pickerModalOverlay}>
                <View style={styles.pickerModalContent}>
                  <ScrollView>{months.map((month: string) => (
                    <TouchableOpacity key={month} onPress={() => { setEndMonth(month); setShowEndMonthModal(false); }}>
                      <Text style={styles.pickerOption}>{month}</Text>
                    </TouchableOpacity>
                  ))}</ScrollView>
                </View>
              </View>
            </Modal>
            <Modal visible={showEndYearModal} transparent animationType="fade">
              <View style={styles.pickerModalOverlay}>
                <View style={styles.pickerModalContent}>
                  <ScrollView>{years.map((year: string) => (
                    <TouchableOpacity key={year} onPress={() => { setEndYear(year); setShowEndYearModal(false); }}>
                      <Text style={styles.pickerOption}>{year}</Text>
                    </TouchableOpacity>
                  ))}</ScrollView>
                </View>
              </View>
            </Modal>
            <Text style={styles.helperText}>e.g. 2025-06-01</Text>
            <View style={styles.row}>
              {(['High', 'Medium', 'Low'] as const).map(priority => (
                <TouchableOpacity
                  key={priority}
                  style={[styles.priorityButton, newMilestone.priority === priority && { backgroundColor: '#4CAF50' }]}
                  onPress={() => setNewMilestone({ ...newMilestone, priority })}
                >
                  <Text style={styles.priorityButtonText}>{priority}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.row}>
              {(['Not Started', 'In Progress', 'Completed'] as const).map(status => (
                <TouchableOpacity
                  key={status}
                  style={[styles.statusButton, newMilestone.status === status && { backgroundColor: statusColors[status] }]}
                  onPress={() => setNewMilestone({ ...newMilestone, status })}
                >
                  <Text style={styles.statusButtonText}>{status}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Parts input */}
            <View style={styles.partsInputHeader}>
              <Text style={styles.partsInputLabel}>Break into parts/subtasks:</Text>
              <TouchableOpacity onPress={addPart} style={styles.addPartButton}>
                <MaterialIcons name="add" size={18} color="#4CAF50" />
                <Text style={styles.addPartText}>Add Part</Text>
              </TouchableOpacity>
            </View>
            {(newMilestone.parts || []).map((part, idx) => (
              <View key={idx} style={styles.partInputRow}>
                <TextInput
                  style={styles.partInput}
                  placeholder={`Part ${idx + 1}`}
                  placeholderTextColor="#888"
                  value={part.name}
                  onChangeText={text => updatePartName(idx, text)}
                />
                <TouchableOpacity onPress={() => removePart(idx)}>
                  <MaterialIcons name="delete" size={18} color="#FF4444" />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => { setModalVisible(false); setEditingMilestone(null); }}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveMilestone}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#2A2A2A', padding: 20, },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  homeButton: { padding: 8 },
  title: { fontSize: 32, color: '#FFF', fontWeight: '700' },
  date: { fontSize: 16, color: '#B2B2B2' },
  instructionBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#263238', borderRadius: 8, padding: 10, marginBottom: 10 },
  instructionText: { color: '#B2B2B2', fontSize: 14, flex: 1 },
  helperText: { color: '#888', fontSize: 12, marginBottom: 8, marginLeft: 4 },
  filterTabs: { flexDirection: 'row', marginBottom: 10 },
  filterTab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: '#3A3A3A' },
  selectedFilterTab: { borderBottomColor: '#4CAF50' },
  filterTabText: { color: '#B2B2B2', fontSize: 15 },
  selectedFilterTabText: { color: '#FFF', fontWeight: '600' },
  list: { flex: 1 },
  milestoneItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#333', borderRadius: 10, padding: 12, marginBottom: 12 },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  milestoneInfo: { flex: 1 },
  milestoneName: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  milestoneDates: { color: '#B2B2B2', fontSize: 13 },
  milestoneMeta: { color: '#FFBB33', fontSize: 13, marginBottom: 4 },
  progressBarBg: { height: 8, backgroundColor: '#555', borderRadius: 4, marginTop: 6, marginBottom: 2, width: '100%' },
  progressBar: { height: 8, borderRadius: 4 },
  progressText: { color: '#B2B2B2', fontSize: 12, marginTop: 2 },
  milestoneActions: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#4CAF50', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  clearButton: { backgroundColor: '#E91E63', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  clearButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#3A3A3A', borderRadius: 20, padding: 20, width: '90%', maxWidth: 400 },
  modalTitle: { fontSize: 22, color: '#FFF', fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#2A2A2A', borderRadius: 10, padding: 15, color: '#FFF', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priorityButton: { flex: 1, padding: 10, borderRadius: 10, marginHorizontal: 5, backgroundColor: '#2A2A2A' },
  priorityButtonText: { color: '#FFF', textAlign: 'center' },
  statusButton: { flex: 1, padding: 10, borderRadius: 10, marginHorizontal: 5, backgroundColor: '#2A2A2A' },
  statusButtonText: { color: '#FFF', textAlign: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButton: { flex: 1, padding: 15, borderRadius: 10, marginHorizontal: 5 },
  cancelButton: { backgroundColor: '#666' },
  saveButton: { backgroundColor: '#4CAF50' },
  buttonText: { color: '#FFF', textAlign: 'center', fontSize: 16, fontWeight: '600' },
  partsList: { marginTop: 8 },
  partsInputHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 4 },
  partsInputLabel: { color: '#B2B2B2', fontSize: 14, flex: 1 },
  addPartButton: { flexDirection: 'row', alignItems: 'center' },
  addPartText: { color: '#4CAF50', fontSize: 14, marginLeft: 2 },
  partInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  partInput: { flex: 1, backgroundColor: '#222', borderRadius: 8, padding: 8, color: '#FFF', marginRight: 8 },
  partText: { color: '#FFF', fontSize: 13, marginLeft: 4 },
  partItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dateDropdownRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dropdown: { flex: 1, padding: 10, borderRadius: 10, marginHorizontal: 5, backgroundColor: '#2A2A2A' },
  dropdownText: { color: '#FFF', textAlign: 'center' },
  pickerModalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  pickerModalContent: { backgroundColor: '#3A3A3A', borderRadius: 20, padding: 20, width: '90%', maxWidth: 400 },
  pickerOption: { color: '#FFF', fontSize: 16, padding: 10 },
});

export default ProgressTracker; 