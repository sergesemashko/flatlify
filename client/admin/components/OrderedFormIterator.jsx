import React, { Component } from 'react';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import { translate } from 'ra-core';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

import DraggableFormInput from './DraggableFormInput';

const sanitizeProps = ({ classes, ...props }) => props;

const styles = theme => ({
  root: {
    padding: 0,
    marginBottom: 0,
    '& > li:last-child': {
      borderBottom: 'none',
    },
  },
  line: {
    display: 'flex',
    listStyleType: 'none',
    borderBottom: `solid 1px ${theme.palette.divider}`,
    [theme.breakpoints.down('xs')]: { display: 'block' },
    '&.fade-enter': {
      opacity: 0.01,
      transform: 'translateX(100vw)',
    },
    '&.fade-enter-active': {
      opacity: 1,
      transform: 'translateX(0)',
      transition: 'all 500ms ease-in',
    },
    '&.fade-exit': {
      opacity: 1,
      transform: 'translateX(0)',
    },
    '&.fade-exit-active': {
      opacity: 0.01,
      transform: 'translateX(100vw)',
      transition: 'all 500ms ease-in',
    },
  },
  form: { flex: 2 },
  action: {
    paddingTop: '0.5em',
  },
});

export class OrderedFormIterator extends Component {
  constructor(props) {
    super(props);
    // we need a unique id for each field for a proper enter/exit animation
    // but redux-form doesn't provide one (cf https://github.com/erikras/redux-form/issues/2735)
    // so we keep an internal map between the field position and an autoincrement id
    this.nextId = 0;
    this.state = {
      ids: props.fields ? props.fields.map(() => this.nextId++) : [],
    };
  }

  removeField = removedIndex => () => {
    const { fields } = this.props;
    const ids = this.state.ids.filter((e, i) => i !== removedIndex);
    fields.remove(removedIndex);
    this.setState({ ids });
  };

  addField = () => {
    const { fields } = this.props;
    const ids = [...this.state.ids, this.nextId++];
    fields.push({});
    this.setState({ ids });
  };

  onDragEnd = result => {
    if (!result.destination) {
      return;
    }
    const { fields } = this.props;
    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    const ids = [...this.state.ids];
    const [removed] = ids.splice(startIndex, 1);

    ids.splice(endIndex, 0, removed);
    this.setState({ ids }, () => fields.move(startIndex, endIndex));
  };

  render() {
    const {
      classes = {},
      fields,
      meta: { error, submitFailed },
      translate,
    } = this.props;
    return fields ? (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppable">
          {provided => (
            <ul className={classes.root} ref={provided.innerRef}>
              {submitFailed && error && <span>{error}</span>}
              <TransitionGroup>
                {fields.map((member, index) => {
                  return (
                    <CSSTransition key={`${this.state.ids[index]}`} timeout={500} classNames="fade">
                      <DraggableFormInput
                        id={`${this.state.ids[index]}`}
                        index={index}
                        member={member}
                        onRemove={this.removeField}
                        {...sanitizeProps(this.props)}
                      />
                    </CSSTransition>
                  );
                })}
                {provided.placeholder}
              </TransitionGroup>
              <li className={classes.line}>
                <span className={classes.action}>
                  <Button size="small" onClick={this.addField}>
                    <AddIcon className={classes.leftIcon} />
                    {translate('ra.action.add')}
                  </Button>
                </span>
              </li>
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    ) : null;
  }
}

OrderedFormIterator.propTypes = {
  basePath: PropTypes.string,
  children: PropTypes.node,
  classes: PropTypes.object,
  className: PropTypes.string,
  fields: PropTypes.object,
  meta: PropTypes.object,
  record: PropTypes.object,
  resource: PropTypes.string,
  translate: PropTypes.func,
};

export default compose(translate, withStyles(styles))(OrderedFormIterator);
