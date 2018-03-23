
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Input from '../Input';
import Enum from '../Enum';
import Repeated from '../Repeated';
import CollapsedIcon from '../../media/collapsed.svg';
import { noop, preventDefault } from '../../utils';

import './index.scss';



class Message extends Component {
    static propTypes = {
        value: PropTypes.array.isRequired,
        name: PropTypes.string.isRequired,
        collapsed: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]).isRequired,
        nestedDepth: PropTypes.number.isRequired,
        onChange: PropTypes.func
    };
    static defaultProps = {
        onChange: noop
    };

    constructor(...args) {
        super(...args);
        const { nestedDepth, collapsed } = this.props;
        this.state = {
            collapsed: typeof collapsed === 'number' ?
                nestedDepth >= collapsed : !!collapsed
        };
    }

    state = { collapsed: false };

    handleToggleCollapsed = (e, collapsed) => {
        preventDefault(e);
        this.setState({
            collapsed: typeof collapsed === 'boolean' ?
                collapsed : !this.state.collapsed
        });
    };

    generateOnChange = (node) => {
        return (e, value) => {
            const { value: newValue } = this.props;
            newValue.find(i => i === node).value = value;
            this.props.onChange(e, newValue);
        };
    };
    renderInput = (node) => {
        const { name, type, value } = node;
        return (
            <div
                className="tree-input-item"
                key={name}
            >
                <div className="tree-input-item-info">
                    <span className="tree-input-item-name">"{name}"</span>
                    <span className="tree-input-item-type">: {type}</span>
                </div>
                <Input
                    className="tree-input-item-input"
                    name={name}
                    type={type}
                    value={value}
                    onChange={this.generateOnChange(node)}
                />
            </div>
        );
    };
    renderEnum = (node) => {
        const { name, fieldInfo, value } = node;
        return (
            <div
                className="tree-input-item"
                key={name}
            >
                <div className="tree-input-item-info">
                    <span className="tree-input-item-name">"{name}"</span>
                    <span className="tree-input-item-type">: enum</span>
                </div>
                <Enum
                    name={name}
                    value={value}
                    fieldInfo={fieldInfo}
                    onChange={this.generateOnChange(node)}
                />
            </div>
        );
    };
    renderMessage = (node) => {
        const { fieldInfo, name } = node;
        const { nestedDepth, collapsed } = this.props;
        return (
            <Message
                key={name}
                value={fieldInfo}
                name={name}
                nestedDepth={nestedDepth + 1}
                collapsed={collapsed}
                onChange={this.generateOnChange(node)}
            />
        );
    };
    renderRepeated = (node) => {
        const { name, type, fieldInfo, value } = node;
        const { nestedDepth, collapsed } = this.props;
        return (
            <Repeated
                key={name}
                value={value || []}
                name={name}
                typeOrFieldInfo={fieldInfo || type}
                collapsed={collapsed}
                nestedDepth={nestedDepth + 1}
                onChange={this.generateOnChange(node)}
            />
        );
    };
    renderNode = (node) => {
        const { label, type } = node;
        if (label === 'REPEATED') {
            return this.renderRepeated(node);
        } else {
            switch (type) {
                case 'message': return this.renderMessage(node);
                case 'enum': return this.renderEnum(node);
                default: return this.renderInput(node);
            }
        }
    };
    render() {
        const { collapsed } = this.state;
        const { value, value: { length }, name, nestedDepth } = this.props;
        return (
            <div
                className={`tree-input${collapsed ? ' tree-input-collapsed' : ''}${nestedDepth === 1 ? ' tree-input-root' : ''}`}
                key={name}
            >
                <div
                    className="tree-input-start"
                    onClick={this.handleToggleCollapsed}
                >
                    <img
                        className="tree-input-expand"
                        src={CollapsedIcon}
                    />
                    <span className="tree-input-name">"{name}": </span>
                    <span>{"\u007b"}</span>
                    <span if={collapsed}> <span if={length > 0}>...</span> }</span>
                    <span className="tree-input-count">{length} Items</span>
                </div>
                <div className="tree-input-items">{value.map(this.renderNode)}</div>
                <div className="tree-input-end">
                    <span onClick={this.handleToggleCollapsed}>{"\u007d"}</span>
                </div>
            </div>
        );
    }
}


export default Message;
