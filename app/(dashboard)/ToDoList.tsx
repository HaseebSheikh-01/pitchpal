import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Task {
  id: string;
  name: string;
  dueDate?: string;
  priority: 'High' | 'Medium' | 'Low';
  category: 'Upcoming' | 'In Progress' | 'Completed';
  completed: boolean;
}

const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() + i).toString());

const ToDoList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'Upcoming' | 'In Progress' | 'Completed'>('Upcoming');
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    name: '',
    priority: 'Medium',
    category: 'Upcoming',
    completed: false,
    dueDate: '',
  });
  const [showDayModal, setShowDayModal] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  // Load tasks from AsyncStorage on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (e) {
        console.error('Failed to load tasks', e);
      }
    };
    loadTasks();
  }, []);

  // Save tasks to AsyncStorage whenever they change
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      } catch (e) {
        console.error('Failed to save tasks', e);
      }
    };
    saveTasks();
  }, [tasks]);

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDropdownDate = () => {
    if (selectedDay && selectedMonth && selectedYear) {
      return `${selectedMonth} ${selectedDay}, ${selectedYear}`;
    }
    return '';
  };

  const handleAddTask = () => {
    if (newTask.name) {
      const task: Task = {
        id: Date.now().toString(),
        name: newTask.name,
        dueDate: getDropdownDate(),
        priority: newTask.priority as 'High' | 'Medium' | 'Low',
        category: newTask.category as 'Upcoming' | 'In Progress' | 'Completed',
        completed: false,
      };
      setTasks([...tasks, task]);
      setNewTask({
        name: '',
        priority: 'Medium',
        category: 'Upcoming',
        completed: false,
        dueDate: '',
      });
      setSelectedDay('');
      setSelectedMonth('');
      setSelectedYear('');
      setAddModalVisible(false);
    }
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, completed: !task.completed, category: !task.completed ? 'Completed' : 'Upcoming' }
        : task
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleClearCompleted = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

  const handleMoveCategory = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        let nextCategory: Task['category'];
        if (task.category === 'Upcoming') nextCategory = 'In Progress';
        else if (task.category === 'In Progress') nextCategory = 'Completed';
        else nextCategory = 'Completed';
        return { ...task, category: nextCategory, completed: nextCategory === 'Completed' };
      }
      return task;
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return '#FF4444';
      case 'Medium':
        return '#FFBB33';
      case 'Low':
        return '#00C851';
      default:
        return '#FFFFFF';
    }
  };

  const getStatusColor = (category: string) => {
    switch (category) {
      case 'Upcoming':
        return '#FF4444';
      case 'In Progress':
        return '#FFBB33';
      case 'Completed':
        return '#00C851';
      default:
        return '#FFFFFF';
    }
  };

  const filteredTasks = tasks.filter(task => task.category === selectedCategory);

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>To-Do List</Text>
        <Text style={styles.date}>{getCurrentDate()}</Text>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        {(['Upcoming', 'In Progress', 'Completed'] as const).map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryTab,
              selectedCategory === category && styles.selectedCategoryTab,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.selectedCategoryText,
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      <ScrollView style={styles.taskList}>
        {filteredTasks.map((task) => (
          <View key={task.id} style={styles.taskItem}>
            {/* Priority Indicator */}
            <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(task.priority || 'Medium') }]} />
            <View style={styles.taskLeft}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => handleToggleComplete(task.id)}
              >
                <MaterialIcons
                  name={task.completed ? 'check-box' : 'check-box-outline-blank'}
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <View style={styles.taskInfo}>
                <Text style={[styles.taskName, task.completed && styles.completedTask]}>
                  {task.name}
                </Text>
                {task.dueDate && (
                  <Text style={styles.dueDate}>
                    Due: {task.dueDate}
                  </Text>
                )}
                <Text style={styles.priorityLabel}>{task.priority} Priority</Text>
              </View>
            </View>
            <View style={styles.taskRight}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(task.category) },
                ]}
              />
              <TouchableOpacity
                style={styles.moveButton}
                onPress={() => handleMoveCategory(task.id)}
              >
                <MaterialIcons name="redo" size={24} color="#FFBB33" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteTask(task.id)}
              >
                <MaterialIcons name="delete" size={24} color="#FF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Task Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setAddModalVisible(true)}
      >
        <MaterialIcons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Clear Completed Button */}
      {tasks.some(task => task.completed) && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearCompleted}
        >
          <Text style={styles.clearButtonText}>Clear Completed Tasks</Text>
        </TouchableOpacity>
      )}

      {/* Add Task Modal */}
      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Task Name"
              placeholderTextColor="#666666"
              value={newTask.name}
              onChangeText={(text) => setNewTask({ ...newTask, name: text })}
            />

            <View style={styles.dateDropdownRow}>
              <TouchableOpacity style={styles.dropdown} onPress={() => setShowDayModal(true)}>
                <Text style={styles.dropdownText}>{selectedDay || 'Day'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdown} onPress={() => setShowMonthModal(true)}>
                <Text style={styles.dropdownText}>{selectedMonth || 'Month'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdown} onPress={() => setShowYearModal(true)}>
                <Text style={styles.dropdownText}>{selectedYear || 'Year'}</Text>
              </TouchableOpacity>
            </View>

            <Modal visible={showDayModal} transparent animationType="fade">
              <View style={styles.pickerModalOverlay}>
                <View style={styles.pickerModalContent}>
                  <ScrollView>
                    {days.map((day) => (
                      <TouchableOpacity key={day} onPress={() => { setSelectedDay(day); setShowDayModal(false); }}>
                        <Text style={styles.pickerOption}>{day}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>

            <Modal visible={showMonthModal} transparent animationType="fade">
              <View style={styles.pickerModalOverlay}>
                <View style={styles.pickerModalContent}>
                  <ScrollView>
                    {months.map((month) => (
                      <TouchableOpacity key={month} onPress={() => { setSelectedMonth(month); setShowMonthModal(false); }}>
                        <Text style={styles.pickerOption}>{month}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>

            <Modal visible={showYearModal} transparent animationType="fade">
              <View style={styles.pickerModalOverlay}>
                <View style={styles.pickerModalContent}>
                  <ScrollView>
                    {years.map((year) => (
                      <TouchableOpacity key={year} onPress={() => { setSelectedYear(year); setShowYearModal(false); }}>
                        <Text style={styles.pickerOption}>{year}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Modal>

            <View style={styles.priorityContainer}>
              {(['High', 'Medium', 'Low'] as const).map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityButton,
                    newTask.priority === priority && {
                      backgroundColor: getPriorityColor(priority),
                    },
                  ]}
                  onPress={() => setNewTask({ ...newTask, priority })}
                >
                  <Text style={styles.priorityButtonText}>{priority}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddTask}
              >
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
  container: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  date: {
    fontSize: 16,
    color: '#B2B2B2',
  },
  categoryTabs: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#3A3A3A',
  },
  selectedCategoryTab: {
    borderBottomColor: '#4CAF50',
  },
  categoryText: {
    color: '#B2B2B2',
    fontSize: 16,
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  taskList: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3A3A3A',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    position: 'relative',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 10,
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#666666',
  },
  dueDate: {
    color: '#B2B2B2',
    fontSize: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  moveButton: {
    padding: 5,
    marginRight: 5,
  },
  deleteButton: {
    padding: 5,
  },
  addButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#4CAF50',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  clearButton: {
    position: 'absolute',
    bottom: 150,
    right: 20,
    backgroundColor: '#E91E63',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#3A3A3A',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
    color: '#FFFFFF',
    marginBottom: 15,
  },
  dateDropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dropdown: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
  },
  dropdownText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  pickerModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerModalContent: {
    backgroundColor: '#3A3A3A',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: 300,
  },
  pickerOption: {
    color: '#FFFFFF',
    fontSize: 16,
    padding: 10,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  priorityButton: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    backgroundColor: '#2A2A2A',
  },
  priorityButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#666666',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  priorityIndicator: {
    width: 6,
    height: '100%',
    borderRadius: 3,
    marginRight: 10,
  },
  priorityLabel: {
    color: '#B2B2B2',
    fontSize: 12,
    marginTop: 2,
  },
});

export default ToDoList; 