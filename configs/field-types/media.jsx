import React, { useState, useEffect } from 'react';
import Router from 'next/router';
import { saveMedia, loadMedia } from '../../core/client/api/content';
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

const renderSingleDropZone = (setValue, setMediaUrl, setTouched, props, classes) => {
  const { onBlur, forwardedRef, ...rest } = props;
  return (
    <div
      className={classes.dropZoneWrapper}
      onClick={() => Router.push('/admin/media')}
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

const renderMultipleDropZone = (setValue, setMediaUrl, setTouched, props, classes) => {
  const { onBlur, forwardedRef, ...rest } = props;
  return (
    <div
      className={classes.multipleDropZoneWrapper}
      onClick={() => Router.push('/admin/media')}
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

const renderPreview = (
  mediaUrl,
  setMediaUrl,
  setValue,
  mediaHover,
  setMediaHover,
  value,
  classes,
  multiple,
) => {
  return (
    <React.Fragment>
      {mediaUrl.map((url, urlIndex) => (
        <div
          className={multiple ? classes.multiPreviewWrapper : classes.singlePreviewWrapper}
          onKeyUp={() => {}}
          role="button"
          tabIndex="0"
          key={urlIndex}
          onMouseEnter={() => setMediaHover(true)}
          onMouseLeave={() => setMediaHover(false)}
        >
          <img src={url} className={classes.imgWrapper} alt="" />
          {mediaHover && (
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

export const Renderer = asField(({ fieldState, fieldApi, label, ...props }) => {
  const { value } = fieldState;
  const { setValue, setTouched } = fieldApi;
  const [mediaUrl, setMediaUrl] = useState([]);
  const [mediaHover, setMediaHover] = useState(false);
  const classes = useStyles();
  const multiple = true;

  useEffect(() => {
    if (value.length === 0) return;
    loadMedia(value).then(res => {
      return res && setMediaUrl(res);
    });
  }, [value]);

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
        {multiple
          ? renderMultipleDropZone(setValue, setMediaUrl, setTouched, props, classes)
          : mediaUrl.length === 0 &&
            renderSingleDropZone(setValue, setMediaUrl, setTouched, props, classes)}
        {renderPreview(
          mediaUrl,
          setMediaUrl,
          setValue,
          mediaHover,
          setMediaHover,
          value,
          classes,
          multiple,
        )}
      </div>
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
