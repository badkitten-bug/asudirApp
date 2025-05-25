"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface Option {
  label: string
  value: string
}

interface SelectDropdownProps {
  title: string
  options: Option[]
  selectedValue?: string
  onSelect: (value: string) => void
  showCamera?: boolean
  onCameraPress?: () => void
  placeholder?: string
  darkMode?: boolean
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window")

const SelectDropdown: React.FC<SelectDropdownProps> = ({
  title,
  options,
  selectedValue,
  onSelect,
  showCamera = false,
  onCameraPress,
  placeholder = "Seleccionar",
  darkMode = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<Option | undefined>(options.find((option) => option.value === selectedValue))
  const slideAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    setSelected(options.find((option) => option.value === selectedValue))
  }, [selectedValue, options])

  const toggleDropdown = () => {
    if (isOpen) {
      // Cerrar el dropdown
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsOpen(false)
      })
    } else {
      // Abrir el dropdown
      setIsOpen(true)
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }
  }

  const handleSelect = (option: Option) => {
    setSelected(option)
    onSelect(option.value)
    toggleDropdown()
  }

  const handleCameraPress = () => {
    if (onCameraPress) {
      onCameraPress()
    }
  }

  const renderOption = ({ item }: { item: Option }) => (
    <TouchableOpacity style={styles.option} onPress={() => handleSelect(item)}>
      <View style={styles.optionContent}>
        {selected?.value === item.value && (
          <Ionicons name="checkmark" size={18} color="#00A86B" style={styles.checkIcon} />
        )}
        <Text style={styles.optionText}>{item.label}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <Text style={[styles.title, darkMode ? { color: "#333" } : { color: "#fff" }]}>{title}</Text>
      <TouchableOpacity style={styles.dropdownButton} onPress={toggleDropdown}>
        <Text style={[styles.dropdownButtonText, !selected && styles.placeholderText]}>
          {selected ? selected.label : placeholder}
        </Text>
        <View style={styles.rightIcons}>
          {showCamera && (
            <TouchableOpacity style={styles.cameraButton} onPress={handleCameraPress}>
              <Ionicons name="camera-outline" size={20} color="#666" />
            </TouchableOpacity>
          )}
          <Ionicons name="chevron-down" size={20} color="#666" />
        </View>
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="none">
        <TouchableWithoutFeedback onPress={toggleDropdown}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.dropdown,
                  {
                    transform: [
                      {
                        translateY: slideAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-20, 0],
                        }),
                      },
                    ],
                    opacity: slideAnimation,
                  },
                ]}
              >
                <Text style={styles.dropdownTitle}>{placeholder}</Text>
                <FlatList
                  data={options}
                  renderItem={renderOption}
                  keyExtractor={(item) => item.value}
                  style={styles.optionsList}
                  showsVerticalScrollIndicator={false}
                />
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dropdownButtonText: {
    color: "#333",
    fontSize: 14,
  },
  placeholderText: {
    color: "#999",
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  cameraButton: {
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  dropdown: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  optionsList: {
    maxHeight: SCREEN_HEIGHT * 0.4,
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkIcon: {
    marginRight: 8,
  },
  optionText: {
    fontSize: 14,
    color: "#333",
  },
})

export default SelectDropdown

