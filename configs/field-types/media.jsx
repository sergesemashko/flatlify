import React, { useState, useEffect } from 'react';
import { saveMedia, loadMedia } from '../../core/client/api/content';
import MediaLibrary from '../../core/ui/mediaLibrary';
import InputLabel from '@material-ui/core/InputLabel';
import S from 'string';
import { asField } from 'informed';
import { makeStyles } from '@material-ui/core/styles';
import RemoveIcon from '@material-ui/icons/Clear';
import DownloadIcon from '@material-ui/icons/SaveAlt';
import AddIcon from '@material-ui/icons/Add';
import { colors } from '@material-ui/core';

const useStyles = makeStyles({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  singlePreviewWrapper: {
    margin: 20,
    height: 180,
    width: 350,
    position: 'relative',
    '&:hover': {
      opacity: 0.6,
    },
  },
  multiPreviewWrapper: {
    marginLeft: 20,
    marginRight: 20,
    height: 150,
    width: 150,
    position: 'relative',
  },
  imgWrapper: {
    height: '100%',
    width: '100%',
  },
  dropZoneWrapper: {
    height: 180,
    width: 350,
    backgroundColor: colors.grey[200],
    padding: 10,
    margin: 20,
    '&:hover': {
      backgroundColor: colors.grey[100],
    },
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    border: '1px dashed silver',
  },
  input: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    opacity: 0,
    cursor: 'pointer',
  },
  removeIcon: {
    position: 'absolute',
    right: 5,
    cursor: 'pointer',
  },
  downloadIcon: {
    height: 30,
    width: 30,
  },
  dragInfoLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: 'black',
  },
  clickInfoLabel: {
    fontSize: 10,
    color: colors.grey[500],
    paddingBottom: 10,
  },
  multipleDropZoneWrapper: {
    border: '1px solid black',
    height: 150,
    width: 150,
  },
  multipleDropZoneWithPreviewWrapper: {
    display: 'flex',
    height: 150,
    width: '100%',
    marginBottom: 20,
    marginTop: 20,
  },
  addIcon: {
    height: 50,
    width: 50,
  },
});

export const Renderer = asField(({ fieldState, fieldApi, label, ...props }) => {
  const { value } = fieldState;
  const { setValue, setTouched } = fieldApi;
  const { onBlur, forwardedRef, ...rest } = props;
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [mediaUrl, setMediaUrl] = useState([]);
  const [mediaHover, setMediaHover] = useState(null);
  const classes = useStyles();
  const multiple = true;

  useEffect(() => {
    if (value.length === 0) return;
    loadMedia(value).then(res => res && setMediaUrl(res));
  }, [value]);

  const SingleDropZone = () => {
    return (
      <div
        className={classes.dropZoneWrapper}
        onClick={() => setModalIsOpen(true)}
        onKeyUp={() => {}}
        role="button"
        tabIndex="0"
      >
        <div className={classes.inputWrapper}>
          <input
            {...rest}
            ref={forwardedRef}
            type="file"
            onClick={e => e.preventDefault()}
            onChange={e => handleChange(e, setValue, setMediaUrl)}
            onBlur={e => {
              setTouched(true);
              if (onBlur) {
                onBlur(e);
              }
            }}
            className={classes.input}
          />
          <div className={classes.dragInfoLabel}>DRAG AND DROP A FILE</div>
          <div className={classes.clickInfoLabel}>(OR CLICK TO BROWSE)</div>
          <DownloadIcon className={classes.downloadIcon} />
        </div>
      </div>
    );
  };

  const MultipleDropZone = () => {
    return (
      <div
        className={classes.multipleDropZoneWrapper}
        onClick={() => setModalIsOpen(true)}
        onKeyUp={() => {}}
        role="button"
        tabIndex="0"
      >
        <div className={classes.inputWrapper}>
          <input
            {...rest}
            ref={forwardedRef}
            type="file"
            multiple={true}
            onClick={e => e.preventDefault()}
            onChange={e => handleChange(e, setValue, setMediaUrl)}
            onBlur={e => {
              setTouched(true);
              if (onBlur) {
                onBlur(e);
              }
            }}
            className={classes.input}
          />
          <AddIcon className={classes.addIcon} />
        </div>
      </div>
    );
  };

  const MediaPreview = () => {
    return (
      <React.Fragment>
        {mediaUrl.map((url, urlIndex) => (
          <div
            className={multiple ? classes.multiPreviewWrapper : classes.singlePreviewWrapper}
            onKeyUp={() => {}}
            role="button"
            tabIndex="0"
            key={urlIndex}
            onMouseEnter={() => {
              setMediaHover(urlIndex);
            }}
            onMouseLeave={() => {
              setMediaHover(null);
            }}
          >
            <img src={url} className={classes.imgWrapper} alt="" />
            {mediaHover === urlIndex && (
              <RemoveIcon
                onClick={() =>
                  handleMultipleRemoveMedia(setMediaUrl, setValue, mediaUrl, value, urlIndex)
                }
                className={classes.removeIcon}
              />
            )}
          </div>
        ))}
      </React.Fragment>
    );
  };

  return (
    <div className={classes.wrapper}>
      {label && <InputLabel>{S(label).capitalize().s}</InputLabel>}
      <div
        className={
          multiple
            ? classes.multipleDropZoneWithPreviewWrapper
            : classes.singleDropZoneWithPreviewWrapper
        }
      >
        {multiple ? <MultipleDropZone /> : mediaUrl.length === 0 && <SingleDropZone />}
        <MediaPreview />
      </div>
      <MediaLibrary
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
        value={value}
        setValue={setValue}
        mediaUrl={mediaUrl}
        setMediaUrl={setMediaUrl}
        multiple={multiple}
      />
    </div>
  );
});

const handleChange = (e, setValue, setMediaUrl) => {
  const files = Object.values(e.target.files);
  const fileNames = [];
  const mediaUrls = [];
  const data = new FormData();

  files.forEach(file => {
    data.append('file', file);
    fileNames.push(file.name);
    mediaUrls.push(URL.createObjectURL(file));
  });
  setValue(fileNames);
  saveMedia(data);
  setMediaUrl(mediaUrls);
};

const handleMultipleRemoveMedia = (setMediaUrl, setValue, mediaUrl, value, urlIndex) => {
  const mediaUrls = [...mediaUrl];
  mediaUrls.splice(urlIndex, 1);
  const values = [...value];
  values.splice(urlIndex, 1);
  setMediaUrl(mediaUrls);
  setValue(values);
};

export const validator = ({ value, required }) => {};

export const defaultValue = '';
