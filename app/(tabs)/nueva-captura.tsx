"use client"

import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StatusBar as RNStatusBar, Image, Modal, Alert } from "react-native"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import Constants from "expo-constants"
import { useNuevaCaptura } from "@/features/nueva-captura/hooks/useNuevaCaptura"
import { NuevaCapturaHeader } from "@/features/nueva-captura/components/NuevaCapturaHeader"
import { FormSection, FormInput } from "@/features/nueva-captura/components/FormSection"
import { nuevaCapturaStyles } from "@/features/nueva-captura/styles/nuevaCaptura.styles"
import CameraScreen from "@/components/CameraScreen"
import Checkbox from '@/components/Checkbox'
import { MedidorVolumetricoSection } from '@/features/lectura-pozo/components/MedidorVolumetricoSection'
import { ObservacionesSection } from '@/features/lectura-pozo/components/ObservacionesSection'
import { FotosSection } from '@/features/lectura-pozo/components/FotosSection'
import { AnomaliasSection } from '@/features/lectura-pozo/components/AnomaliasSection'
import { TicketPreviewModalSection } from '@/features/lectura-pozo/components/TicketPreviewModalSection'
import { ANOMALIAS_VOLUMETRICO } from '@/features/lectura-pozo/constants/lecturaPozo.constants'

const STATUSBAR_HEIGHT = Constants.statusBarHeight || 0

export default function NuevaCapturaScreen() {
  const {
    pozoId,
    pozoNombre,
    pozoUbicacion,
    form,
    pozoInfo,
    loadingPozo,
    showPreview,
    photoFile,
    photoFileElec,
    inputRef,
    inputRefElec,
    handleBack,
    handleOpenCamera,
    handlePhotoTaken,
    handleCloseCamera,
    handleOpenCameraElec,
    handlePhotoTakenElec,
    handleCloseCameraElec,
    handleGenerateTicket,
    handleChoosePhotoOption,
    handleChoosePhotoOptionElec,
    handleFileInputChange,
    handleFileInputChangeElec,
    handlePickImage,
    handlePickImageElec,
    handleConfirmar,
    setShowPreview,
  } = useNuevaCaptura()

  return (
    <View style={nuevaCapturaStyles.container}>
      {/* Configuración del StatusBar nativo */}
      <RNStatusBar backgroundColor="#f5f5f5" barStyle="dark-content" translucent={true} />

      {/* StatusBar de Expo como respaldo */}
      <StatusBar style="dark" />

      {/* Espacio para el StatusBar */}
      <View style={{ height: STATUSBAR_HEIGHT, backgroundColor: "#f5f5f5" }} />

      <NuevaCapturaHeader
        pozoNombre={pozoNombre}
        pozoUbicacion={pozoUbicacion}
        onBack={handleBack}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={nuevaCapturaStyles.content}>
          {/* Sección de Medidor Volumétrico */}
          <MedidorVolumetricoSection
            form={form}
            onChoosePhoto={handleChoosePhotoOption}
            onPhotoTaken={handlePhotoTaken}
            onCloseCamera={handleCloseCamera}
            showCamera={form.showCamera}
            photoUri={form.photoUri}
            inputRef={inputRef}
            handleFileInputChange={handleFileInputChange}
            photoFile={photoFile}
          />

          {/* Sección de Medidor Eléctrico */}
          <FormSection title="Medidor Eléctrico">
            <FormInput
              label="Lectura Eléctrica"
              value={form.lecturaElectrica}
              onChangeText={form.setLecturaElectrica}
              placeholder="Ingrese la lectura del medidor eléctrico"
              keyboardType="numeric"
            />

            <FotosSection
              title="Foto del Medidor Eléctrico"
              photoUri={form.photoUriElec}
              onChoosePhoto={handleChoosePhotoOptionElec}
              onPhotoTaken={handlePhotoTakenElec}
              onCloseCamera={handleCloseCameraElec}
              showCamera={form.showCameraElec}
              inputRef={inputRefElec}
              handleFileInputChange={handleFileInputChangeElec}
              photoFile={photoFileElec}
            />
          </FormSection>

          {/* Sección de Observaciones */}
          <ObservacionesSection
            observaciones={form.observaciones}
            setObservaciones={form.setObservaciones}
          />

          {/* Sección de Anomalías */}
          <AnomaliasSection
            anomalias={form.anomalias}
            setAnomalias={form.setAnomalias}
            anomaliasOptions={ANOMALIAS_VOLUMETRICO}
          />

          {/* Botón de Confirmar */}
          <TouchableOpacity style={nuevaCapturaStyles.confirmButton} onPress={handleGenerateTicket}>
            <Text style={nuevaCapturaStyles.confirmButtonText}>Generar Ticket</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Cámara */}
      {form.showCamera && (
        <CameraScreen
          onPhotoTaken={handlePhotoTaken}
          onClose={handleCloseCamera}
          title="Foto del Medidor Volumétrico"
        />
      )}

      {form.showCameraElec && (
        <CameraScreen
          onPhotoTaken={handlePhotoTakenElec}
          onClose={handleCloseCameraElec}
          title="Foto del Medidor Eléctrico"
        />
      )}

      {/* Modal de Previsualización */}
      <TicketPreviewModalSection
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        form={form}
        pozoInfo={pozoInfo}
        onConfirmar={handleConfirmar}
      />
    </View>
  )
}

