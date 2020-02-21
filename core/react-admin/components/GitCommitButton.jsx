import React from 'react'
import PropTypes from 'prop-types'
import {
  useUpdateMany,
  useRefresh,
  useNotify,
  useUnselectAll,
  Button,
  CRUD_UPDATE_MANY,
} from 'react-admin'
import Modal from 'react-modal'
import {TextareaAutosize} from '@material-ui/core';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
  overlay: {
    zIndex: 2,
  }
}

Modal.setAppElement('#__next');

const GitCommitButton = ({ resource, selectedIds }) => {
  const notify = useNotify()
  const unselectAll = useUnselectAll()
  const refresh = useRefresh()
  const [modalIsOpen, setIsOpen] = React.useState(false)
  const [message, setMessage] = React.useState('')

  function openModal () {
    setIsOpen(true)
  }

  function closeModal () {
    setIsOpen(false)
  }

  const [updateMany, { loading }] = useUpdateMany(
    resource,
    selectedIds,
    { gitAction: 'commit', message },
    {
      action: CRUD_UPDATE_MANY,
      onSuccess: () => {
        notify(
          'ra.notification.updated',
          'info',
          { smart_count: selectedIds.length },
          true,
        )
        unselectAll(resource)
        refresh()
      },
      onFailure: error =>
        notify(
          typeof error === 'string'
            ? error
            : error.message || 'ra.notification.http_error',
          'warning',
        ),
      undoable: false,
    },
  )

  return (<>
      <Button
        label="Commit"
        disabled={loading}
        onClick={openModal}
      >
      </Button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Commit Files"
      >
        <TextareaAutosize aria-label="minimum height" value={message} onChange={setMessage} rowsMin={3} placeholder="Enter commit message" />
        <div>
          <Button
            label="Commit"
            disabled={loading}
            onClick={updateMany}
          >
          </Button>
        </div>
      </Modal>
    </>
  )
}

GitCommitButton.propTypes = {
  basePath: PropTypes.string,
  label: PropTypes.string,
  resource: PropTypes.string.isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.any).isRequired,
}

export default GitCommitButton
