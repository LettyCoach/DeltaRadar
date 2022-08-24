import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { 
  switchSortingEnabling,
  changeSortedField,
  scanDataSelector,
} from '../slices/scanData';
import {sortDataByFields, filterDataByFields, pretifyNumber } from '../helpers/helpers';
import { TokenSequence, ExchangeSequence } from '../helpers/helperComponents';

const TableHeader = (props) => {

  const dispatch = useDispatch();

  const handleSort = (field) => {
    dispatch(switchSortingEnabling());
    dispatch(changeSortedField(field));
    dispatch(switchSortingEnabling());
  }
  return (
    <thead>
      <tr>
        {props.tableFields.map((fieldKey, index) => {
          const showDescending = props.sortedFieldsDescending[fieldKey];
          return (
            <th key={index} scope="col">
              {props.fields[fieldKey].name}
              <button className={`btn btn-light`} onClick={() => handleSort(fieldKey)} disabled={!props.enableSorting} >
                {showDescending === undefined ? 
                  <i className="bi bi-caret-down"></i>
                :
                  showDescending ? <i className="bi bi-caret-down-fill"></i> : <i className="bi bi-caret-up-fill"></i>
                }
              </button>
            </th>
          )
        })}
      </tr>
    </thead>
  )
}

const TableBody = (props) => {
  return (
    <tbody>
      {props.scanDataChunk.map((dataRow, indexRow) => {
        return (
          <tr key={indexRow}>
            {props.tableFields.map((fieldKey, indexField) => {
              if(fieldKey !== 'tokenSequence' && fieldKey !== 'exchangeSequence' && fieldKey !== 'timestamp') {
                let value = dataRow[props.fields[fieldKey].index];
                if(props.fields[fieldKey].isNumerical) value = pretifyNumber(value);
                return(
                  <td  key={indexField}><div className="d-flex flex-nowrap justify-content-center">{value}</div></td>
                );
              } else if (fieldKey === 'tokenSequence') {
                const tokenArray = dataRow[props.fields[fieldKey].index].split('=>');
                return (
                  <td key={indexField}>
                    <TokenSequence
                      color='dark'
                      tokenData={props.tokenData}
                      tokenArray={tokenArray}
                      scannerDomain={props.scannerDomain}
                    />
                  </td>
                );
              } else if (fieldKey === 'exchangeSequence') {
                const exchangeArray = dataRow[props.fields[fieldKey].index].split('=>');
                return(
                  <td key={indexField}>
                    <ExchangeSequence 
                      color='dark'
                      exchangeArray={exchangeArray} 
                    />
                  </td>
                );
              } else if (fieldKey === 'timestamp') {
                const dateArray = dataRow[props.fields[fieldKey].index];
                const timestamp = new Date(...dateArray);
                return (
                  <td key={indexField}>{`${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}`}</td>
                );
              }

            })}
          </tr>
        )        
      })
      }
    </tbody>
  )
}

const ScanTable = () => {

  const {
    loading,
    hasErrors,
    blockchainSelection,
    blockchainParameters,
    combinedData,
    fields,
    tableFields,
    sortingEnabled,
    sortedFieldsDescending,
    filteredFields
  } = useSelector(scanDataSelector);

  const renderChart = () => {
    if(loading) return (
      <div className="d-flex w-100 align-items-center justify-content-between p-2">
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>        
      </div>

    )
    if(hasErrors) return <p>Unable to display data</p>

    let displayArray = filterDataByFields(combinedData, filteredFields, fields);

    displayArray = sortDataByFields(displayArray, fields, sortedFieldsDescending);

    return (
      <table className="table">
        <TableHeader
          fields={fields}
          tableFields={tableFields}
          sortedFieldsDescending={sortedFieldsDescending}
          enableSorting={sortingEnabled} />
        <TableBody 
          scanDataChunk={displayArray.slice(0, 50)}
          tableFields={tableFields}
          fields={fields}
          tokenData={blockchainParameters[blockchainSelection].tokenData}
          scannerDomain={blockchainParameters[blockchainSelection].scannerDomain} />
      </table>
    );
  }

  return (
    <div className="container">
      {renderChart()}
    </div>
  )
}

export default ScanTable;