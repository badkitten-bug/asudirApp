import React from 'react';
import TicketPreviewModal from '@/components/TicketPreviewModal';

interface TicketPreviewModalSectionProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  ticketData: {
    pozoNombre: string;
    pozoId: string;
    volumen: string;
    gasto: string;
    lecturaElectrica: string;
    observaciones: string;
    anomaliasVol: string[];
    anomaliasElec: string[];
    fecha: string;
    photoUri?: string | null;
    photoUriElec?: string | null;
  };
}

export function TicketPreviewModalSection({
  visible,
  onClose,
  onConfirm,
  ticketData,
}: TicketPreviewModalSectionProps) {
  return (
    <TicketPreviewModal
      visible={visible}
      onClose={onClose}
      onConfirm={onConfirm}
      ticketData={ticketData}
      photoUri={ticketData.photoUri}
      photoUriElec={ticketData.photoUriElec}
    />
  );
} 