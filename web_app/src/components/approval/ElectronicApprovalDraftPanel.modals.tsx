import React from 'react';
import {
  Snackbar,
  Alert,
} from '@mui/material';
import ApproverSelectionModal from '../leave/ApproverSelectionModal';
import ReferenceSelectionModal from '../leave/ReferenceSelectionModal';
import type { EApprovalCcPerson } from '../../types/eapproval';

type ElectronicApprovalDraftModalsProps = {
  isApproverModalOpen: boolean;
  isReferenceModalOpen: boolean;
  isSequentialApproval: boolean;
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: 'success' | 'error';
  approverIds: string[];
  ccList: EApprovalCcPerson[];
  onCloseApprover: () => void;
  onConfirmApprover: (ids: string[], selectedApprovers: any[]) => void;
  onCloseReference: () => void;
  onConfirmReference: (selected: EApprovalCcPerson[]) => void;
  onSnackbarClose: () => void;
};

const ElectronicApprovalDraftPanelModals: React.FC<ElectronicApprovalDraftModalsProps> = ({
  isApproverModalOpen,
  isReferenceModalOpen,
  isSequentialApproval,
  snackbarOpen,
  snackbarMessage,
  snackbarSeverity,
  approverIds,
  ccList,
  onCloseApprover,
  onConfirmApprover,
  onCloseReference,
  onConfirmReference,
  onSnackbarClose,
}) => (
  <>
    <ApproverSelectionModal
      open={isApproverModalOpen}
      onClose={onCloseApprover}
      onConfirm={onConfirmApprover}
      initialSelectedApproverIds={approverIds}
      sequentialApproval={isSequentialApproval}
    />

    <ReferenceSelectionModal
      open={isReferenceModalOpen}
      onClose={onCloseReference}
      onConfirm={onConfirmReference}
      currentReferences={ccList.map(c => ({ ...c, department: c.department || '' }))}
    />

    <Snackbar
      open={snackbarOpen}
      autoHideDuration={3000}
      onClose={onSnackbarClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={onSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
        {snackbarMessage}
      </Alert>
    </Snackbar>
  </>
);

export default ElectronicApprovalDraftPanelModals;
