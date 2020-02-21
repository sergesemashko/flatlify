import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { removeMedia, mediaList, saveMedia } from '../../../core/client/api/content';
import { makeStyles } from '@material-ui/core/styles';
import RemoveIcon from '@material-ui/icons/Clear';

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  card: {
    height: 250,
    width: 250,
    borderRadius: 10,
    padding: 10,
    position: 'relative',
  },
  img: {
    height: 250,
    width: 250,
    borderRadius: 10,
    '&:hover': {
      opacity: 0.5,
    },
  },
  cardsWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%',
  },
  label: {
    fontSize: 20,
    fontWeight: 700,
    padding: 20,
  },
  removeIcon: {
    right: 20,
    top: 10,
    position: 'absolute',
  },
  upload: {
    opacity: 0,
    position: 'absolute',
    zIndex: -1,
  },
  uploadLabel: {
    cursor: 'pointer',
    fontSize: 20,
    fontWeight: 700,
    padding: 20,
  },
  uploadWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  labelWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  modal: {
    height: '70%',
    width: '80%',
    position: 'relative',
  },
  closeModalIcon: {
    position: 'absolute',
    top: '2%',
    right: '1%',
    cursor: 'pointer',
  },
  modalContent: {
    top: '15%',
    left: '15%',
    right: '15%',
    bottom: '15%',
    overflow: 'visible',
  },
};

const MediaLibrary = props => {
  const classes = makeStyles(styles)();
  const [cardHover, setCardHover] = useState(null);
  const [mediaArray, setMediaArray] = useState([]);
  const { setModalIsOpen, modalIsOpen, value, setValue, mediaUrl, setMediaUrl, multiple } = props;

  useEffect(() => {
    mediaList().then(data => setMediaArray(data));
  }, []);

  useEffect(() => props.setModalIsOpen(props.modalIsOpen), [props, props.modalIsOpen]);

  const handleChange = e => {
    const files = Object.values(e.target.files);
    const data = new FormData();

    files.forEach(file => {
      data.append('file', file);
    });
    saveMedia(data);
    mediaList().then(data => setMediaArray(data));
  };

  const Library = () => {
    const cards = mediaArray.map((media, index) => (
      <div
        key={index}
        className={classes.card}
        onMouseEnter={() => setCardHover(index)}
        onMouseLeave={() => setCardHover(null)}
      >
        {/* eslint-disable-next-line */}
        <img
          src={`/${media.url}`}
          className={classes.img}
          alt=""
          onKeyUp={() => {}}
          onClick={() => {
            const updateValue = [...value];
            const updateMediaUrl = [...mediaUrl];
            if (multiple) {
              updateValue.push(media.filename);
              updateMediaUrl.push(`/${media.url}`);
              setValue(updateValue);
              setMediaUrl(updateMediaUrl);
            } else {
              setValue([media.filename]);
              setMediaUrl([`/${media.url}`]);
            }
            setModalIsOpen(false);
          }}
        />
        {cardHover === index && (
          <RemoveIcon
            className={classes.removeIcon}
            onClick={() => {
              removeMedia(media);
              mediaList().then(data => setMediaArray(data));
            }}
          />
        )}
      </div>
    ));
    return cards;
  };

  return (
    <Modal
      isOpen={modalIsOpen}
      onAfterOpen={() => mediaList().then(data => setMediaArray(data))}
      onRequestClose={() => setModalIsOpen(false)}
      style={{
        content: styles.modalContent,
      }}
      ariaHideApp={false}
    >
      <div className={classes.wrapper}>
        <div className={classes.labelWrapper}>
          <div className={classes.label}>Media library</div>
          <div className={classes.uploadWrapper}>
            <label className={classes.uploadLabel} htmlFor="upload">
              Upload
            </label>
            <input
              className={classes.upload}
              type="file"
              name="photo"
              id="upload"
              multiple={true}
              onChange={e => handleChange(e)}
            />
          </div>
        </div>
        <div className={classes.cardsWrapper}>
          <Library />
        </div>
      </div>
      <RemoveIcon className={classes.closeModalIcon} onClick={() => setModalIsOpen(false)} />
    </Modal>
  );
};

export default MediaLibrary;
