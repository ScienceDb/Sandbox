import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { blueGrey } from '@material-ui/core/colors';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import api from '../../../../../../../../../../../requests/requests.index.js';
import { makeCancelable } from '../../../../../../../../../../../utils'
import ContactToAddTransferViewToolbar from './components/ContactToAddTransferViewToolbar';
import ContactToAddTransferViewCursorPagination from './components/ContactToAddTransferViewCursorPagination';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import Hidden from '@material-ui/core/Hidden';
import Fade from '@material-ui/core/Fade';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Add from '@material-ui/icons/AddCircle';
import Remove from '@material-ui/icons/RemoveCircle';
import TransferArrows from '@material-ui/icons/SettingsEthernetOutlined';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(0),
    minWidth: 200,
  },
  card: {
    margin: theme.spacing(1),
    height: 'auto',
    maxHeight: `calc(64vh + 52px)`,
    overflow: 'auto',
    position: "relative",
  },
  listBox: {
    height: 'auto',
    minHeight: 82,
    maxHeight: '33vh',
    overflowY: 'auto',
    overflowX: 'hidden'
  },
  noDataBox: {
    width: "100%",
    height: 'auto',
    minHeight: 82,
    maxHeight: '33vh',
  },
  loadingBox: {
    width: "100%",
    height: '100%',
    maxHeight: '33vh',
  },
  arrowsBox: {
    marginTop: theme.spacing(3),
  },
  arrowsV: {
    transform: "rotate(90deg)",
  },
  row: {
    maxHeight: 70,
  },
  id: {
    width: 33,
  },
  dividerV: {
    height: 50,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  notiErrorActionText: {
    color: '#eba0a0',
  },
}));

export default function ContactToAddTransferView(props) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const {
    item,
    idsToAdd,
    handleTransfer,
    handleUntransfer,
    handleClickOnContactRow,
  } = props;

  /*
    State Table A (available)
  */
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isOnApiRequest, setIsOnApiRequest] = useState(false);
  const [isCountReady, setIsCountReady] = useState(false);
  const [areItemsReady, setAreItemsReady] = useState(false);
  const [dataTrigger, setDataTrigger] = useState(false);
  const isPendingApiRequestRef = useRef(false);
  const isOnApiRequestRef = useRef(false);
  const isGettingFirstDataRef = useRef(true);
  const pageRef = useRef(0);
  const lastFetchTime = useRef(null);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const pageInfo = useRef({startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false});
  const isForwardPagination = useRef(true);
  const isCursorPaginating = useRef(false);
  const includeCursor = useRef(false);

  /*
    State Table B (to add)
  */
  const [itemsB, setItemsB] = useState([]);
  const [countB, setCountB] = useState(0);
  const [searchB, setSearchB] = useState('');
  const [pageB, setPageB] = useState(0);
  const [rowsPerPageB, setRowsPerPageB] = useState(50);
  const [isOnApiRequestB, setIsOnApiRequestB] = useState(false);
  const [isCountReadyB, setIsCountReadyB] = useState(false);
  const [areItemsReadyB, setAreItemsReadyB] = useState(false);
  const [dataTriggerB, setDataTriggerB] = useState(false);
  const isPendingApiRequestRefB = useRef(false);
  const isOnApiRequestRefB = useRef(false);
  const isGettingFirstDataRefB = useRef(true);
  const pageRefB = useRef(0);
  const lastFetchTimeB = useRef(null);
  const [hasPreviousPageB, setHasPreviousPageB] = useState(false);
  const [hasNextPageB, setHasNextPageB] = useState(false);
  const pageInfoB = useRef({startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false});
  const isForwardPaginationB = useRef(true);
  const isCursorPaginatingB = useRef(false);
  const includeCursorB = useRef(false);

  const [thereAreItemsToAdd, setThereAreItemsToAdd] = useState((idsToAdd && Array.isArray(idsToAdd) && idsToAdd.length > 0));
  const lidsToAdd = useRef((idsToAdd && Array.isArray(idsToAdd)) ? Array.from(idsToAdd) : []);
  const lidsAssociated = useRef(undefined);

  const cancelablePromises = useRef([]);

  const graphqlServerUrl = useSelector(state => state.urls.graphqlServerUrl)
  const lastModelChanged = useSelector(state => state.changes.lastModelChanged);
  const lastChangeTimestamp = useSelector(state => state.changes.lastChangeTimestamp);

  const actionText = useRef(null);
  const action = useRef((key) => (
    <>
      <Button color='inherit' variant='text' size='small' className={classes.notiErrorActionText} onClick={() => { closeSnackbar(key) }}>
        {actionText.current}
      </Button>
    </> 
  ));

  const lref = useRef(null);
  const lrefB = useRef(null);
  const [lh, setLh] = useState(82);
  const [lhB, setLhB] = useState(82);

  /**
   * getData
   * 
   * Get @items and @count from GrahpQL Server.
   * Uses current state properties to fill query request.
   * Updates state to inform new @items and @count retrieved.
   * 
   */
  const getData = useCallback(() => {
    isOnApiRequestRef.current = true;
    setIsOnApiRequest(true);
    Boolean(dataTrigger); //avoid warning

    //if ids associated needs to be fetched.
    if(lidsAssociated.current === undefined) {
      /*
        API Request: associated contact ids
      */
      let cancelableApiReq = makeCancelable(api.study_to_contact.getAssociatedContactConnection(graphqlServerUrl, item.id));  
      cancelablePromises.current.push(cancelableApiReq);
      cancelableApiReq
        .promise
        .then(response => {
          //delete from cancelables
          cancelablePromises.current.splice(cancelablePromises.current.indexOf(cancelableApiReq), 1);
          //check response
          if (
            response.data &&
            response.data.data
          ) {
            //notify graphql errors
            if(response.data.errors) {
              actionText.current = t('modelPanels.gotIt', "Got it");
              enqueueSnackbar( t('modelPanels.errors.e3', "The GraphQL query returned a response with errors. Please contact your administrator."), {
                variant: 'error',
                preventDuplicate: false,
                persist: true,
                action: action.current,
              });
              console.log("Errors: ", response.data.errors);
            }
            //set internalId
            let idso = response.data.data.readOneStudy_to_contact.contact;
            lidsAssociated.current = (idso&&typeof idso==='object'&&idso.hasOwnProperty('contactDbId')) ? [idso.contactDbId] : [];

            //set ops: excluded ids: toAddId
            let ops = null;
            if(lidsToAdd.current.length > 0) {
              ops = {
                exclude: [{
                  type: 'String',
                  values: {contactDbId: lidsToAdd.current}
                }]
              };
            }
              /*
              API Request: countItems
            */
            let cancelableApiReqB = makeCancelable(api.contact.getCountItems(graphqlServerUrl, search, ops));
            cancelablePromises.current.push(cancelableApiReqB);
            cancelableApiReqB
              .promise
              .then(response => {
                //delete from cancelables
                cancelablePromises.current.splice(cancelablePromises.current.indexOf(cancelableApiReqB), 1);
                //check response
                if (
                  response.data &&
                  response.data.data
                ) {
                  //notify graphql errors
                  if(response.data.errors) {
                    actionText.current = t('modelPanels.gotIt', "Got it");
                    enqueueSnackbar( t('modelPanels.errors.e3', "The GraphQL query returned a response with errors. Please contact your administrator."), {
                      variant: 'error',
                      preventDuplicate: false,
                      persist: true,
                      action: action.current,
                    });
                    console.log("Errors: ", response.data.errors);
                  }
                  //save response data
                  let newCount = response.data.data.countContacts;

                  /*
                    API Request: items
                  */
                  let variables = {
                    pagination: {
                      after: isForwardPagination.current ? pageInfo.current.endCursor : null,
                      before: !isForwardPagination.current ? pageInfo.current.startCursor : null,
                      first: isForwardPagination.current ? rowsPerPage : null,
                      last: !isForwardPagination.current ? rowsPerPage : null,
                      includeCursor: includeCursor.current,
                    }
                  };
                  let cancelableApiReqC = makeCancelable(api.contact.getItemsConnection(
                    graphqlServerUrl,
                    search,
                    null, //orderBy
                    null, //orderDirection
                    variables,
                    ops
                  ));
                  cancelablePromises.current.push(cancelableApiReqC);
                  cancelableApiReqC
                    .promise
                    .then(response => {
                      //delete from cancelables
                      cancelablePromises.current.splice(cancelablePromises.current.indexOf(cancelableApiReqC), 1);
                      //check response
                      if (
                        response.data &&
                        response.data.data
                      ) {
                        //notify graphql errors
                        if(response.data.errors) {
                          actionText.current = t('modelPanels.gotIt', "Got it");
                          enqueueSnackbar( t('modelPanels.errors.e3', "The GraphQL query returned a response with errors. Please contact your administrator."), {
                            variant: 'error',
                            preventDuplicate: false,
                            persist: true,
                            action: action.current,
                          });
                          console.log("Errors: ", response.data.errors);
                        }
                        //save response data
                        let its = response.data.data.contactsConnection.edges.map(o => o.node);
                        let pi = response.data.data.contactsConnection.pageInfo;

                        /*
                          Check: empty page
                        */
                        if( its.length === 0 && pi&&pi.hasPreviousPage ) 
                        {
                          //configure
                          isOnApiRequestRef.current = false;
                          isCursorPaginating.current = false;
                          isForwardPagination.current = false;
                          setIsOnApiRequest(false);
                          
                          //reload
                          setDataTrigger(prevDataTrigger => !prevDataTrigger);
                          return;
                        }//else

                        //update pageInfo
                        pageInfo.current = pi;
                        setHasPreviousPage(pageInfo.current.hasPreviousPage);
                        setHasNextPage(pageInfo.current.hasNextPage);

                        //ok
                        setCount((newCount&&typeof newCount==='number') ? newCount : 0);
                        setItems(its&&Array.isArray(its) ? its : []);
                        isOnApiRequestRef.current = false;
                        isCursorPaginating.current = false;
                        includeCursor.current = false;
                        setIsOnApiRequest(false);
                        return;

                      } else { //error: bad response on getItems()
                        actionText.current = t('modelPanels.gotIt', "Got it");
                        enqueueSnackbar( t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."), {
                          variant: 'error',
                          preventDuplicate: false,
                          persist: true,
                          action: action.current,
                        });
                        console.log("Error: ", t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."));
                        //update pageInfo
                        pageInfo.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
                        setHasPreviousPage(pageInfo.current.hasPreviousPage);
                        setHasNextPage(pageInfo.current.hasNextPage);
                        setCount(0);
                        setItems([]);
                        isOnApiRequestRef.current = false;
                        setIsOnApiRequest(false);
                        return;
                      }
                    })
                    .catch(({isCanceled, ...err}) => { //error: on getItems()
                      if(isCanceled) {
                        return;
                      } else {
                        actionText.current = t('modelPanels.gotIt', "Got it");
                        enqueueSnackbar( t('modelPanels.errors.e1', "An error occurred while trying to execute the GraphQL query. Please contact your administrator."), {
                          variant: 'error',
                          preventDuplicate: false,
                          persist: true,
                          action: action.current,
                        });
                        console.log("Error: ", err);
                        //update pageInfo
                        pageInfo.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
                        setHasPreviousPage(pageInfo.current.hasPreviousPage);
                        setHasNextPage(pageInfo.current.hasNextPage);
                        setCount(0);
                        setItems([]);
                        isOnApiRequestRef.current = false;
                        setIsOnApiRequest(false);
                        return;
                      }
                    });

                  return;
                } else {  //error: bad response on getCountItems()
                  actionText.current = t('modelPanels.gotIt', "Got it");
                  enqueueSnackbar( t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."), {
                    variant: 'error',
                    preventDuplicate: false,
                    persist: true,
                    action: action.current,
                  });
                  console.log("Error: ", t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."));
                  //update pageInfo
                  pageInfo.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
                  setHasPreviousPage(pageInfo.current.hasPreviousPage);
                  setHasNextPage(pageInfo.current.hasNextPage);
                  setCount(0);
                  setItems([]);
                  isOnApiRequestRef.current = false;
                  setIsOnApiRequest(false);
                  return;
                }
              })
              .catch(({isCanceled, ...err}) => { //error: on getCountItems()
                if(isCanceled) {
                  return;
                } else {
                  actionText.current = t('modelPanels.gotIt', "Got it");
                  enqueueSnackbar( t('modelPanels.errors.e1', "An error occurred while trying to execute the GraphQL query. Please contact your administrator."), {
                    variant: 'error',
                    preventDuplicate: false,
                    persist: true,
                    action: action.current,
                  });
                  console.log("Error: ", err);
                  //update pageInfo
                  pageInfo.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
                  setHasPreviousPage(pageInfo.current.hasPreviousPage);
                  setHasNextPage(pageInfo.current.hasNextPage);
                  setCount(0);
                  setItems([]);
                  isOnApiRequestRef.current = false;
                  setIsOnApiRequest(false);
                  return;
                }
              });

          } else {  //error: bad response on getAssociatedIds()
            actionText.current = t('modelPanels.gotIt', "Got it");
            enqueueSnackbar( t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."), {
              variant: 'error',
              preventDuplicate: false,
              persist: true,
              action: action.current,
            });
            console.log("Error: ", t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."));
            //update pageInfo
            pageInfo.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
            setHasPreviousPage(pageInfo.current.hasPreviousPage);
            setHasNextPage(pageInfo.current.hasNextPage);
            setCount(0);
            setItems([]);
            isOnApiRequestRef.current = false;
            setIsOnApiRequest(false);
            return;
          }
        })
        .catch(({isCanceled, ...err}) => { //error: on getAssociatedIds()
          if(isCanceled) {
            return;
          } else {
            actionText.current = t('modelPanels.gotIt', "Got it");
            enqueueSnackbar( t('modelPanels.errors.e1', "An error occurred while trying to execute the GraphQL query. Please contact your administrator."), {
              variant: 'error',
              preventDuplicate: false,
              persist: true,
              action: action.current,
            });
            console.log("Error: ", err);
            //update pageInfo
            pageInfo.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
            setHasPreviousPage(pageInfo.current.hasPreviousPage);
            setHasNextPage(pageInfo.current.hasNextPage);
            setCount(0);
            setItems([]);
            isOnApiRequestRef.current = false;
            setIsOnApiRequest(false);
            return;
          }
        });

    }
    else { //do getData directly
      //set ops: excluded ids: toAddId
      let ops = null;
      if(lidsToAdd.current.length > 0) {
        ops = {
          exclude: [{
            type: 'String',
            values: {contactDbId: lidsToAdd.current}
          }]
        };
      }

      /*
        API Request: countItems
      */
      let cancelableApiReq = makeCancelable(api.contact.getCountItems(graphqlServerUrl, search, ops));
      cancelablePromises.current.push(cancelableApiReq);
      cancelableApiReq
        .promise
        .then(response => {
          //delete from cancelables
          cancelablePromises.current.splice(cancelablePromises.current.indexOf(cancelableApiReq), 1);
          //check response
          if (
            response.data &&
            response.data.data
          ) {
            //notify graphql errors
            if(response.data.errors) {
              actionText.current = t('modelPanels.gotIt', "Got it");
              enqueueSnackbar( t('modelPanels.errors.e3', "The GraphQL query returned a response with errors. Please contact your administrator."), {
                variant: 'error',
                preventDuplicate: false,
                persist: true,
                action: action.current,
              });
              console.log("Errors: ", response.data.errors);
            }
            //save response data
            let newCount = response.data.data.countContacts;

            /*
              API Request: items
            */
            let variables = {
              pagination: {
                after: isForwardPagination.current ? pageInfo.current.endCursor : null,
                before: !isForwardPagination.current ? pageInfo.current.startCursor : null,
                first: isForwardPagination.current ? rowsPerPage : null,
                last: !isForwardPagination.current ? rowsPerPage : null,
                includeCursor: includeCursor.current,
              }
            };
            let cancelableApiReqB = makeCancelable(api.contact.getItemsConnection(
              graphqlServerUrl,
              search,
              null, //orderBy
              null, //orderDirection
              variables,
              ops
            ));
            cancelablePromises.current.push(cancelableApiReqB);
            cancelableApiReqB
              .promise
              .then(response => {
                //delete from cancelables
                cancelablePromises.current.splice(cancelablePromises.current.indexOf(cancelableApiReqB), 1);
                //check response
                if (
                  response.data &&
                  response.data.data
                ) {
                  //notify graphql errors
                  if(response.data.errors) {
                    actionText.current = t('modelPanels.gotIt', "Got it");
                    enqueueSnackbar( t('modelPanels.errors.e3', "The GraphQL query returned a response with errors. Please contact your administrator."), {
                      variant: 'error',
                      preventDuplicate: false,
                      persist: true,
                      action: action.current,
                    });
                    console.log("Errors: ", response.data.errors);
                  }
                  //save response data
                  let its = response.data.data.contactsConnection.edges.map(o => o.node);
                  let pi = response.data.data.contactsConnection.pageInfo;

                  /*
                    Check: empty page
                  */
                  if( its.length === 0 && pi&&pi.hasPreviousPage ) 
                  {
                    //configure
                    isOnApiRequestRef.current = false;
                    isCursorPaginating.current = false;
                    isForwardPagination.current = false;
                    setIsOnApiRequest(false);
                    
                    //reload
                    setDataTrigger(prevDataTrigger => !prevDataTrigger);
                    return;
                  }//else

                  //update pageInfo
                  pageInfo.current = pi;
                  setHasPreviousPage(pageInfo.current.hasPreviousPage);
                  setHasNextPage(pageInfo.current.hasNextPage);

                  //ok
                  setCount((newCount&&typeof newCount==='number') ? newCount : 0);
                  setItems(its&&Array.isArray(its) ? its : []);
                  isOnApiRequestRef.current = false;
                  isCursorPaginating.current = false;
                  includeCursor.current = false;
                  setIsOnApiRequest(false);
                  return;

                } else { //error: bad response on getItems()
                  actionText.current = t('modelPanels.gotIt', "Got it");
                  enqueueSnackbar( t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."), {
                    variant: 'error',
                    preventDuplicate: false,
                    persist: true,
                    action: action.current,
                  });
                  console.log("Error: ", t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."));
                  //update pageInfo
                  pageInfo.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
                  setHasPreviousPage(pageInfo.current.hasPreviousPage);
                  setHasNextPage(pageInfo.current.hasNextPage);
                  
                  setCount(0);
                  setItems([]);
                  isOnApiRequestRef.current = false;
                  setIsOnApiRequest(false);
                  return;
                }
              })
              .catch(({isCanceled, ...err}) => { //error: on getItems()
                if(isCanceled) {
                  return;
                } else {
                  actionText.current = t('modelPanels.gotIt', "Got it");
                  enqueueSnackbar( t('modelPanels.errors.e1', "An error occurred while trying to execute the GraphQL query. Please contact your administrator."), {
                    variant: 'error',
                    preventDuplicate: false,
                    persist: true,
                    action: action.current,
                  });
                  console.log("Error: ", err);
                  //update pageInfo
                  pageInfo.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
                  setHasPreviousPage(pageInfo.current.hasPreviousPage);
                  setHasNextPage(pageInfo.current.hasNextPage);
                  setCount(0);
                  setItems([]);
                  isOnApiRequestRef.current = false;
                  setIsOnApiRequest(false);
                  return;
                }
              });

            return;
          } else { //error: bad response on getCountItems()
            actionText.current = t('modelPanels.gotIt', "Got it");
            enqueueSnackbar( t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."), {
              variant: 'error',
              preventDuplicate: false,
              persist: true,
              action: action.current,
            });
            console.log("Error: ", t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."));
            //update pageInfo
            pageInfo.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
            setHasPreviousPage(pageInfo.current.hasPreviousPage);
            setHasNextPage(pageInfo.current.hasNextPage);
            setCount(0);
            setItems([]);
            isOnApiRequestRef.current = false;
            setIsOnApiRequest(false);
            return;
          }
        })
        .catch(({isCanceled, ...err}) => { //error: on getCountItems()
          if(isCanceled) {
            return;
          } else {
            actionText.current = t('modelPanels.gotIt', "Got it");
            enqueueSnackbar( t('modelPanels.errors.e1', "An error occurred while trying to execute the GraphQL query. Please contact your administrator."), {
              variant: 'error',
              preventDuplicate: false,
              persist: true,
              action: action.current,
            });
            console.log("Error: ", err);
            //update pageInfo
            pageInfo.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
            setHasPreviousPage(pageInfo.current.hasPreviousPage);
            setHasNextPage(pageInfo.current.hasNextPage);
            setCount(0);
            setItems([]);
            isOnApiRequestRef.current = false;
            setIsOnApiRequest(false);
            return;
          }
        });

    }//end: else: do getData directly
  }, [graphqlServerUrl, enqueueSnackbar, t, dataTrigger, item.id, search, rowsPerPage]);

  /**
   * getDataB
   * 
   * Get @items and @count from GrahpQL Server.
   * Uses current state properties to fill query request.
   * Updates state to inform new @items and @count retreived.
   * 
   */
  const getDataB = useCallback(() => {
    isOnApiRequestRefB.current = true;
    setIsOnApiRequestB(true);
    Boolean(dataTriggerB); //avoid warning

    //set ops: only ids
    let ops = null;
    if(lidsToAdd.current !== undefined && lidsToAdd.current.length > 0) {
      ops = {
        only: [{
          type: 'String',
          values: {contactDbId: lidsToAdd.current}
        }]
      };
    } else {
      //update pageInfo
      pageInfoB.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
      setHasPreviousPageB(pageInfoB.current.hasPreviousPage);
      setHasNextPageB(pageInfoB.current.hasNextPage);
      setCountB(0);
      setItemsB([]);
      isOnApiRequestRefB.current = false;
      isCursorPaginatingB.current = false;
      includeCursorB.current = false;
      setIsOnApiRequestB(false);
      setThereAreItemsToAdd(false);
      return;
    }

    /*
      API Request: countItems
    */
    let cancelableApiReq = makeCancelable(api.contact.getCountItems(graphqlServerUrl, searchB, ops));
    cancelablePromises.current.push(cancelableApiReq);
    cancelableApiReq
      .promise
      .then(response => {
        //delete from cancelables
        cancelablePromises.current.splice(cancelablePromises.current.indexOf(cancelableApiReq), 1);
        //check response
        if (
          response.data &&
          response.data.data
        ) {
          //notify graphql errors
          if(response.data.errors) {
            actionText.current = t('modelPanels.gotIt', "Got it");
            enqueueSnackbar( t('modelPanels.errors.e3', "The GraphQL query returned a response with errors. Please contact your administrator."), {
              variant: 'error',
              preventDuplicate: false,
              persist: true,
              action: action.current,
            });
            console.log("Errors: ", response.data.errors);
          }
          //save response data
          let newCount = response.data.data.countContacts;


          /*
            API Request: items
          */
          let variables = {
            pagination: {
              after: isForwardPaginationB.current ? pageInfoB.current.endCursor : null,
              before: !isForwardPaginationB.current ? pageInfoB.current.startCursor : null,
              first: isForwardPaginationB.current ? rowsPerPageB : null,
              last: !isForwardPaginationB.current ? rowsPerPageB : null,
              includeCursor: includeCursorB.current,
            }
          };
          let cancelableApiReqB = makeCancelable(api.contact.getItemsConnection(
            graphqlServerUrl,
            searchB,
            null, //orderBy
            null, //orderDirection
            variables,
            ops
          ));
          cancelablePromises.current.push(cancelableApiReqB);
          cancelableApiReqB
            .promise
            .then(response => {
              //delete from cancelables
              cancelablePromises.current.splice(cancelablePromises.current.indexOf(cancelableApiReqB), 1);
              //check response
              if (
                response.data &&
                response.data.data
              ) {
                //notify graphql errors
                if(response.data.errors) {
                  actionText.current = t('modelPanels.gotIt', "Got it");
                  enqueueSnackbar( t('modelPanels.errors.e3', "The GraphQL query returned a response with errors. Please contact your administrator."), {
                    variant: 'error',
                    preventDuplicate: false,
                    persist: true,
                    action: action.current,
                  });
                  console.log("Errors: ", response.data.errors);
                }
                //save response data
                let its = response.data.data.contactsConnection.edges.map(o => o.node);
                let pi = response.data.data.contactsConnection.pageInfo;

                /*
                  Check: empty page
                */
                if( its.length === 0 && pi&&pi.hasPreviousPage ) 
                {
                  //configure
                  isOnApiRequestRefB.current = false;
                  isCursorPaginatingB.current = false;
                  isForwardPaginationB.current = false;
                  setIsOnApiRequestB(false);
                  
                  //reload
                  setDataTriggerB(prevDataTriggerB => !prevDataTriggerB);
                  return;
                }//else

                //update pageInfo
                pageInfoB.current = pi;
                setHasPreviousPageB(pageInfoB.current.hasPreviousPage);
                setHasNextPageB(pageInfoB.current.hasNextPage);
                
                //ok
                setCountB((newCount&&typeof newCount==='number') ? newCount : 0);
                setItemsB(its&&Array.isArray(its) ? its : []);
                isOnApiRequestRefB.current = false;
                isCursorPaginatingB.current = false;
                isForwardPaginationB.current = false;
                setIsOnApiRequestB(false);
                return;

              } else { //error: bad response on getItems()
                actionText.current = t('modelPanels.gotIt', "Got it");
                enqueueSnackbar( t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."), {
                  variant: 'error',
                  preventDuplicate: false,
                  persist: true,
                  action: action.current,
                });
                console.log("Error: ", t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."));
                //update pageInfo
                pageInfoB.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
                setHasPreviousPageB(pageInfoB.current.hasPreviousPage);
                setHasNextPageB(pageInfoB.current.hasNextPage);
               
                setCountB(0);
                setItemsB([]);
                isOnApiRequestRefB.current = false;
                isCursorPaginatingB.current = false;
                isForwardPaginationB.current = false;
                setIsOnApiRequestB(false);
                return;
              }
            })
            .catch(({isCanceled, ...err}) => { //error: on getItems()
              if(isCanceled) {
                return;
              } else {
                actionText.current = t('modelPanels.gotIt', "Got it");
                enqueueSnackbar( t('modelPanels.errors.e1', "An error occurred while trying to execute the GraphQL query. Please contact your administrator."), {
                  variant: 'error',
                  preventDuplicate: false,
                  persist: true,
                  action: action.current,
                });
                console.log("Error: ", err);
                //update pageInfo
                pageInfoB.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
                setHasPreviousPageB(pageInfoB.current.hasPreviousPage);
                setHasNextPageB(pageInfoB.current.hasNextPage);
                setCountB(0);
                setItemsB([]);
                isOnApiRequestRefB.current = false;
                isCursorPaginatingB.current = false;
                isForwardPaginationB.current = false;
                setIsOnApiRequestB(false);
                return;
              }
            });

          return;
        } else { //error: bad response on getCountItems()
          actionText.current = t('modelPanels.gotIt', "Got it");
          enqueueSnackbar( t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."), {
            variant: 'error',
            preventDuplicate: false,
            persist: true,
            action: action.current,
          });
          console.log("Error: ", t('modelPanels.errors.e2', "An error ocurred while trying to execute the GraphQL query, cannot process server response. Please contact your administrator."));
          //update pageInfo
          pageInfoB.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
          setHasPreviousPageB(pageInfoB.current.hasPreviousPage);
          setHasNextPageB(pageInfoB.current.hasNextPage);
          setCountB(0);
          setItemsB([]);
          isOnApiRequestRefB.current = false;
          isCursorPaginatingB.current = false;
          isForwardPaginationB.current = false;
          setIsOnApiRequestB(false);
          return;
        }
      })
      .catch(({isCanceled, ...err}) => { //error: on getCountItems()
        if(isCanceled) {
          return;
        } else {
          actionText.current = t('modelPanels.gotIt', "Got it");
          enqueueSnackbar( t('modelPanels.errors.e1', "An error occurred while trying to execute the GraphQL query. Please contact your administrator."), {
            variant: 'error',
            preventDuplicate: false,
            persist: true,
            action: action.current,
          });
          console.log("Error: ", err);
          //update pageInfo
          pageInfoB.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
          setHasPreviousPageB(pageInfoB.current.hasPreviousPage);
          setHasNextPageB(pageInfoB.current.hasNextPage);
          setCountB(0);
          setItemsB([]);
          isOnApiRequestRefB.current = false;
          isCursorPaginatingB.current = false;
          isForwardPaginationB.current = false;
          setIsOnApiRequestB(false);
          return;
        }
      });
  }, [graphqlServerUrl, enqueueSnackbar, t, dataTriggerB, searchB, rowsPerPageB]);

  useEffect(() => {

    //cleanup on unmounted.
    return function cleanup() {
      cancelablePromises.current.forEach(p => p.cancel());
      cancelablePromises.current = [];
    };
  }, []);
  
  useEffect(() => {
    if (!isOnApiRequestRef.current) {
      getData();
    } 
    else { 
      isPendingApiRequestRef.current = true; 
    }
  }, [getData]);

  useEffect(() => {
    if (!isOnApiRequestRefB.current) {
      getDataB();
    } 
    else { 
      isPendingApiRequestRefB.current = true; 
    }
  }, [getDataB]);

  useEffect(() => {
    /*
     * Handle changes 
     */
    
    /*
     * Checks
     */
    if(!lastModelChanged) {
      return;
    }
    if(!lastChangeTimestamp || !lastFetchTime.current) {
      return;
    }
    let isNewChangeOnA = (lastFetchTime.current<lastChangeTimestamp);
    let isNewChangeOnB = (lastFetchTimeB.current<lastChangeTimestamp);
    if(!isNewChangeOnA && !isNewChangeOnB) {
      return;
    }

    /*
     * Update timestamps
     */
    lastFetchTime.current = Date.now();
    lastFetchTimeB.current = Date.now();

    /*
     * Case 1: 
     * The relation 'contact' for this item was updated.
     * That is to say that the current item was associated or dis-associated with some 'contacts' (from another place).
     * 
     * Actions:
     * - remove any dis-associated internalId from idsToAdd[]
     * - update associatedIds[].
     * - reload both transfer tables.
     * - return
     */
    if(lastModelChanged.study_to_contact&&
        lastModelChanged.study_to_contact[String(item.id)]&&
        lastModelChanged.study_to_contact[String(item.id)].changedAssociations&&
        lastModelChanged.study_to_contact[String(item.id)].changedAssociations.contact&&
        (lastModelChanged.study_to_contact[String(item.id)].changedAssociations.contact.added ||
         lastModelChanged.study_to_contact[String(item.id)].changedAssociations.contact.removed)) {
          
          //remove any dis-associated internalId from idsToAdd[]
          let idsRemoved = lastModelChanged.study_to_contact[String(item.id)].changedAssociations.contact.idsRemoved;
          if(idsRemoved) {
            idsRemoved.forEach( (idRemoved) => {
              //remove from lidsToAdd
              let iof = lidsToAdd.current.indexOf(idRemoved);
              if(iof !== -1) { 
                lidsToAdd.current.splice(iof, 1);
                if(lidsToAdd.current.length === 0) {
                  setThereAreItemsToAdd(false);
                }
              }
              handleUntransfer('contact', idRemoved);
            });
          }

          //clear associatedIds[] to cause a re-fetch on next getData().
          lidsAssociated.current = undefined;

          //reload
          updateHeights();
          //strict contention
          if (!isOnApiRequestRef.current && !isCursorPaginating.current) {
            //configure A
            isForwardPagination.current = true;
            pageInfo.current.endCursor = pageInfo.current.startCursor;
            includeCursor.current = true;
            //reload A
            setDataTrigger(prevDataTrigger => !prevDataTrigger);
          }
          //strict contention
          if (!isOnApiRequestRefB.current && !isCursorPaginatingB.current) {
            //configure B
            isForwardPaginationB.current = true;
            pageInfoB.current.endCursor = pageInfoB.current.startCursor;
            includeCursorB.current = true;
            //reload B
            setDataTriggerB(prevDataTriggerB => !prevDataTriggerB);
          }
          return;
    }//end: Case 1

    /*
     * Case 2: 
     * The peer relation 'ContactToTrials' for this item was updated.
     * That is to say that this current item was associated or dis-associated with some 'contact',
     * but this action happened on the peer relation 'ContactToTrials'.
     * 
     * Conditions:
     * A: the current item internalId is in the removedIds of the updated 'contact'.
     * B: the current item internalId is in the addedIds of the updated 'contact'.
     * 
     * Actions:
     * if A:
     * - update associatedIds[].
     * - reload both transfer tables.
     * - return
     * 
     * else if B:
     * - remove the internalId of the 'contact' from idsToAdd[].
     * - update associatedIds[].
     * - reload both transfer tables.
     * - return
     */
    if(lastModelChanged.contact) {
      let oens = Object.entries(lastModelChanged.contact);
      oens.forEach( (entry) => {
        if(entry[1].changedAssociations&&
          entry[1].changedAssociations.ContactToTrials) {

            //case A: this item was removed from peer relation.
            if(entry[1].changedAssociations.ContactToTrials.removed) {
              let idsRemoved = entry[1].changedAssociations.ContactToTrials.idsRemoved;
              if(idsRemoved) {
                let iof = idsRemoved.indexOf(item.id);
                if(iof !== -1) {
                  //clear associatedIds[] to cause a re-fetch on next getData().
                  lidsAssociated.current = undefined;

                  //reload
                  updateHeights();
                  //strict contention
                  if (!isOnApiRequestRef.current && !isCursorPaginating.current) {
                    //configure A
                    isForwardPagination.current = true;
                    pageInfo.current.endCursor = pageInfo.current.startCursor;
                    includeCursor.current = true;
                    //reload A
                    setDataTrigger(prevDataTrigger => !prevDataTrigger);
                  }
                  //strict contention
                  if (!isOnApiRequestRefB.current && !isCursorPaginatingB.current) {
                    //configure B
                    isForwardPaginationB.current = true;
                    pageInfoB.current.endCursor = pageInfoB.current.startCursor;
                    includeCursorB.current = true;
                    //reload B
                    setDataTriggerB(prevDataTriggerB => !prevDataTriggerB);
                  }
                  return;
                }
              }
            }//end: case A

            //case B: this item was added on peer relation.
            if(entry[1].changedAssociations.ContactToTrials.added) {
              let idsAdded = entry[1].changedAssociations.ContactToTrials.idsAdded;
              if(idsAdded) {
                let iof = idsAdded.indexOf(item.id);
                if(iof !== -1) {
                  //remove changed item from lidsToAdd
                  let idAdded = entry[1].newItem.contactDbId;
                  let iofB = lidsToAdd.current.indexOf(idAdded);
                  if(iofB !== -1) {
                    lidsToAdd.current.splice(iofB, 1);
                    if(lidsToAdd.current.length === 0) {
                      setThereAreItemsToAdd(false);
                    }
                  }
                  handleUntransfer('contact', idAdded);

                  //clear associatedIds[] to cause a re-fetch on next getData().
                  lidsAssociated.current = undefined;

                  //reload
                  updateHeights();
                  //strict contention
                  if (!isOnApiRequestRef.current && !isCursorPaginating.current) {
                    //configure A
                    isForwardPagination.current = true;
                    pageInfo.current.endCursor = pageInfo.current.startCursor;
                    includeCursor.current = true;
                    //reload A
                    setDataTrigger(prevDataTrigger => !prevDataTrigger);
                  }
                  //strict contention
                  if (!isOnApiRequestRefB.current && !isCursorPaginatingB.current) {
                    //configure B
                    isForwardPaginationB.current = true;
                    pageInfoB.current.endCursor = pageInfoB.current.startCursor;
                    includeCursorB.current = true;
                    //reload B
                    setDataTriggerB(prevDataTriggerB => !prevDataTriggerB);
                  }
                  return;
                }
              }
            }//end: case B
        }
      })
    }//end: Case 2

    /*
     * Case 3: 
     * The attributes of some 'contact' were modified or the item was deleted.
     * 
     * Conditions:
     * A: the item was modified and is currently displayed in any of the lists.
     * B: the item was deleted and is currently displayed in any of the lists or associated ids.
     * 
     * Actions:
     * if A:
     * - update the list with the new item.
     * - return
     * 
     * if B:
     * - remove the deleted internalId from idsToAdd[]
     * - update associatedIds[].
     * - reload both transfer tables.
     * - return
     */
    if(lastModelChanged.contact) {

      let oens = Object.entries(lastModelChanged.contact);
      oens.forEach( (entry) => {
        
        //case A: updated
        if(entry[1].op === "update"&&entry[1].newItem) {
          let idUpdated = entry[1].item.contactDbId;
          
          //lookup item on table A
          let nitemsA = Array.from(items);
          let iofA = nitemsA.findIndex((item) => item.contactDbId===idUpdated);
          if(iofA !== -1) {
            //set new item
            nitemsA[iofA] = entry[1].newItem;
            setItems(nitemsA);
          }

          //lookup item on table B
          let nitemsB = Array.from(itemsB);
          let iofB = nitemsB.findIndex((item) => item.contactDbId===idUpdated);
          if(iofB !== -1) {
            //set new item
            nitemsB[iofB] = entry[1].newItem;
            setItemsB(nitemsB);
          }
        }

        //case B: deleted
        if(entry[1].op === "delete") {
          let idRemoved = entry[1].item.contactDbId;

          //lookup item on any tables or associated ids
          let iofA = items.findIndex((item) => item.contactDbId===idRemoved);
          let iofB = itemsB.findIndex((item) => item.contactDbId===idRemoved);
          let iofC = lidsAssociated.current.indexOf(idRemoved);
          if(iofA !== -1 || iofB !== -1 || iofC !== -1) {
            
            //remove deleted item from lidsToAdd
            let iofD = lidsToAdd.current.indexOf(idRemoved);
            if(iofD !== -1) {
              lidsToAdd.current.splice(iofD, 1);
              if(lidsToAdd.current.length === 0) {
                setThereAreItemsToAdd(false);
              }
            }
            handleUntransfer('contact', idRemoved);

            //clear associatedIds[] to cause a re-fetch on next getData().
            lidsAssociated.current = undefined;

            //reload
            updateHeights();
            //strict contention
            if (!isOnApiRequestRef.current && !isCursorPaginating.current) {
              //configure A
              isForwardPagination.current = true;
              pageInfo.current.endCursor = pageInfo.current.startCursor;
              includeCursor.current = true;
              //reload A
              setDataTrigger(prevDataTrigger => !prevDataTrigger);
            }
            //strict contention
            if (!isOnApiRequestRefB.current && !isCursorPaginatingB.current) {
              //configure B
              isForwardPaginationB.current = true;
              pageInfoB.current.endCursor = pageInfoB.current.startCursor;
              includeCursorB.current = true;
              //reload B
              setDataTriggerB(prevDataTriggerB => !prevDataTriggerB);
            }
            return;
          }
        }
      });
    }//end: Case 3
  }, [lastModelChanged, lastChangeTimestamp, items, itemsB, item.id, handleUntransfer]);

  useEffect(() => {
    //return if this flag is set
    if(isGettingFirstDataRef.current) { 
      isGettingFirstDataRef.current = false; 
      return; 
    } 
    else {
      //get data from the new page
      pageRef.current = page;
      if (!isOnApiRequestRef.current) {
        setDataTrigger(prevDataTrigger => !prevDataTrigger); 
      } 
      else { 
        isPendingApiRequestRef.current = true; 
      }
    }
  }, [page]);

  useEffect(() => {
    //return on first render
    if(isGettingFirstDataRefB.current) { 
      isGettingFirstDataRefB.current = false; 
      return; 
    } 
    else {
      //get data from the new page
      pageRefB.current = pageB;
      if (!isOnApiRequestRefB.current) {
        setDataTriggerB(prevDataTriggerB => !prevDataTriggerB); 
      } 
      else { 
        isPendingApiRequestRefB.current = true; 
      }
    }
  }, [pageB]);

  useEffect(() => {
    if (!isOnApiRequest && isPendingApiRequestRef.current) {
      isPendingApiRequestRef.current = false;
      //configure
      isForwardPagination.current = true;
      pageInfo.current.endCursor = pageInfo.current.startCursor;
      includeCursor.current = true;
      //reload
      setDataTrigger(prevDataTrigger => !prevDataTrigger);
    }
    updateHeights();
  }, [isOnApiRequest]);

  useEffect(() => {
    if (!isOnApiRequestB && isPendingApiRequestRefB.current) {
      isPendingApiRequestRefB.current = false;
      //configure
      isForwardPaginationB.current = true;
      pageInfoB.current.endCursor = pageInfoB.current.startCursor;
      includeCursorB.current = true;
      //reload
      setDataTriggerB(prevDataTriggerB => !prevDataTriggerB);
    }
    updateHeights();
  }, [isOnApiRequestB]);

  useEffect(() => {
    if(items.length > 0) { 
      setAreItemsReady(true); 
    } else { 
      setAreItemsReady(false); 
    }
    lastFetchTime.current = Date.now();
  }, [items]);

  useEffect(() => {
    if(itemsB.length > 0) { 
      setAreItemsReadyB(true); 
    } else { 
      setAreItemsReadyB(false); 
    }
    lastFetchTimeB.current = Date.now();
  }, [itemsB]);

  useEffect(() => {
    if(count === 0) {
      setIsCountReady(false);
    } else {
      setIsCountReady(true);
    }
  }, [count]);

  useEffect(() => {
    if(countB === 0) {
      setIsCountReadyB(false);
    } else {
      setIsCountReadyB(true);
    }
  }, [countB]);

  function updateHeights() {
    if(lref.current) {
      let h =lref.current.clientHeight;
      setLh(h);
    }
    if(lrefB.current) {
      let hb =lrefB.current.clientHeight;
      setLhB(hb);
    }
  }

  function resetPageRefs() {
    isForwardPagination.current = true;
    pageInfo.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
    setHasPreviousPage(pageInfo.current.hasPreviousPage);
    setHasNextPage(pageInfo.current.hasNextPage);
    includeCursor.current = false;
    pageRef.current = 0;
  }

  function resetPageRefsB() {
    isForwardPaginationB.current = true;
    pageInfoB.current = {startCursor: null, endCursor: null, hasPreviousPage: false, hasNextPage: false};
    setHasPreviousPageB(pageInfoB.current.hasPreviousPage);
    setHasNextPageB(pageInfoB.current.hasNextPage);
    includeCursorB.current = false;
    pageRefB.current = 0;
  }

  function resetReloadDataA() {
    //strict contention
    if (isOnApiRequestRef.current || isCursorPaginating.current) { return; }

    //configure A
    resetPageRefs();
    isCursorPaginating.current = true;
    //reload A
    setDataTrigger(prevDataTrigger => !prevDataTrigger);
    updateHeights();
  }

  function resetReloadDataB() {
    //strict contention
    if (isOnApiRequestRefB.current || isCursorPaginatingB.current) { return; }

    //configure B
    resetPageRefsB();
    isCursorPaginatingB.current = true;
    //reload B
    setDataTriggerB(prevDataTriggerB => !prevDataTriggerB);
    updateHeights();
  }

  function reloadDataA() {
    //strict contention
    if (isOnApiRequestRef.current || isCursorPaginating.current) { return; }

    //configure A
    isForwardPagination.current = true;
    pageInfo.current.endCursor = pageInfo.current.startCursor;
    includeCursor.current = true;
    //reload A
    setDataTrigger(prevDataTrigger => !prevDataTrigger);
    updateHeights();
  }

  function reloadDataB() {
    //strict contention
    if (isOnApiRequestRefB.current || isCursorPaginatingB.current) { return; }
    
    //configure B
    isForwardPaginationB.current = true;
    pageInfoB.current.endCursor = pageInfoB.current.startCursor;
    includeCursorB.current = true;
    //reload B
    setDataTriggerB(prevDataTriggerB => !prevDataTriggerB);
    updateHeights();
  }

  /**
   * Handlers
   */

  /*
   * Search handlers
   */
  const handleSearchEnter = text => {
    updateHeights();

    if(text !== search)
    {
      resetPageRefs();
      if(page !== 0) {
        isGettingFirstDataRef.current = true; //avoids to get data on [page] effect
        setPage(0);
      }
      setSearch(text);
    }
  };

  const handleSearchEnterB = text => {
    updateHeights();

    if(text !== searchB)
    {
      resetPageRefsB();
      if(pageB !== 0) {
        isGettingFirstDataRefB.current = true; //avoids to get data on [pageB] effect
        setPageB(0);
      }
      setSearchB(text);
    }
  };

  /*
   * Pagination handlers
   */

  const handleFirstPageButtonClick = (event) => {
    //strict contention
    if (isOnApiRequestRef.current || isCursorPaginating.current) { return; }

    //configure
    isCursorPaginating.current = true;
    includeCursor.current = false;
    isForwardPagination.current = true;
    pageInfo.current.endCursor = null;

    //reload A
    updateHeights();
    setDataTrigger(prevDataTrigger => !prevDataTrigger);
  };
  const handleFirstPageButtonClickB = (event) => {
    //strict contention
    if (isOnApiRequestRefB.current || isCursorPaginatingB.current) { return; }

    //configure
    isCursorPaginatingB.current = true;
    includeCursorB.current = false;
    isForwardPaginationB.current = true;
    pageInfoB.current.endCursor = null;

    //reload B
    updateHeights();
    setDataTriggerB(prevDataTriggerB => !prevDataTriggerB);
  };

  const handleLastPageButtonClick = (event) => {
    //strict contention
    if (isOnApiRequestRef.current || isCursorPaginating.current) { return; }

    //configure
    isCursorPaginating.current = true;
    includeCursor.current = false;
    isForwardPagination.current = false;
    pageInfo.current.startCursor = null;

    //reload A
    updateHeights();
    setDataTrigger(prevDataTrigger => !prevDataTrigger);
  };
  const handleLastPageButtonClickB = (event) => {
    //strict contention
    if (isOnApiRequestRefB.current || isCursorPaginatingB.current) { return; }

    //configure
    isCursorPaginatingB.current = true;
    includeCursorB.current = false;
    isForwardPaginationB.current = false;
    pageInfoB.current.startCursor = null;

    //reload B
    updateHeights();
    setDataTriggerB(prevDataTriggerB => !prevDataTriggerB);
  };

  const handleNextButtonClick = (event) => {
    //strict contention
    if (isOnApiRequestRef.current || isCursorPaginating.current) { return; }

    //configure
    isCursorPaginating.current = true;
    includeCursor.current = false;
    isForwardPagination.current = true;

    //reload A
    updateHeights();
    setDataTrigger(prevDataTrigger => !prevDataTrigger);
  };
  const handleNextButtonClickB = (event) => {
    //strict contention
    if (isOnApiRequestRefB.current || isCursorPaginatingB.current) { return; }

    //configure
    isCursorPaginatingB.current = true;
    includeCursorB.current = false;
    isForwardPaginationB.current = true;

    //reload B
    updateHeights();
    setDataTriggerB(prevDataTriggerB => !prevDataTriggerB);
  };

  const handleBackButtonClick = (event) => {
    //strict contention
    if (isOnApiRequestRef.current || isCursorPaginating.current) { return; }

    //configure
    isCursorPaginating.current = true;
    includeCursor.current = false;
    isForwardPagination.current = false;

    //reload A
    updateHeights();
    setDataTrigger(prevDataTrigger => !prevDataTrigger);
  };
  const handleBackButtonClickB = (event) => {
    //strict contention
    if (isOnApiRequestRefB.current || isCursorPaginatingB.current) { return; }

    //configure
    isCursorPaginatingB.current = true;
    includeCursorB.current = false;
    isForwardPaginationB.current = false;

    //reload B
    updateHeights();
    setDataTriggerB(prevDataTriggerB => !prevDataTriggerB);
  };

  const handleChangeRowsPerPage = event => {
    if(event.target.value !== rowsPerPage)
    {
      resetPageRefs();
      if(page !== 0) {
        isGettingFirstDataRef.current = true; //avoids to get data on [page] effect
        setPage(0);
      }

      updateHeights();
      setRowsPerPage(parseInt(event.target.value, 10));
    }
  };

  const handleChangeRowsPerPageB = event => {
    if(event.target.value !== rowsPerPageB)
    {
      resetPageRefsB();
      if(pageB !== 0) {
        isGettingFirstDataRefB.current = true; //avoids to get data on [pageB] effect
        setPageB(0);
      }
      setRowsPerPageB(parseInt(event.target.value, 10));
    }
  };

  const handleReloadClick = (event) => {
    resetReloadDataA();
  };
  const handleReloadClickB = (event) => {
    resetReloadDataB();
  };

  /*
   * Items handlers
   */
  const handleRowClicked = (event, item) => {
    handleClickOnContactRow(event, item);
  };

  const handleAddItem = (event, item) => {
    if(lidsToAdd.current.indexOf(item.contactDbId) === -1) {
      lidsToAdd.current = [];
      lidsToAdd.current.push(item.contactDbId);
      setThereAreItemsToAdd(true);
      updateHeights();
      //reload A
      reloadDataA();
      //reload B (full)
      resetReloadDataB();
      handleTransfer('contact', item.contactDbId);
    }
  };

  const handleRemoveItem = (event, item) => {
    if(lidsToAdd.current.length > 0) {
      lidsToAdd.current = [];
      setThereAreItemsToAdd(false);
      updateHeights();
      //reload A (full)
      resetReloadDataA();
      //reload B
      reloadDataB();
      handleUntransfer('contact', item.contactDbId);
    }
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={4} alignItems='flex-start' justify='center'>
        {/*
          * Selectable list (A)
          */}
        <Grid item xs={12} sm={5} >
          {(item!==undefined) && (
            <Card className={classes.card}>

              {/* Toolbar */}
              <ContactToAddTransferViewToolbar
                title={'Contacts'}
                titleIcon={1}
                search={search}
                onSearchEnter={handleSearchEnter}
                onReloadClick={handleReloadClick}
              />

              {/* Case: no data */}
              {(!isOnApiRequest && (!areItemsReady || !isCountReady)) && (
                /* Label */
                <Fade
                  in={true}
                  unmountOnExit
                >
                  <div>
                    <Grid container>
                      <Grid item xs={12}>
                        <Grid className={classes.noDataBox} container justify="center" alignItems="center">
                          <Grid item>
                            <Typography variant="body2" >{ t('modelPanels.noData') }</Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </div>
                </Fade>
              )}

              {/* Case: data ready */}
              {(!isOnApiRequest && areItemsReady && isCountReady) && (
              
                /* List */
                <Fade
                  in={true}
                  unmountOnExit
                >
                  <Box className={classes.listBox} ref={lref}>
                    <List dense component="div" role="list" >
                      {items.map(it => {
                        let key = it.contactDbId;
                        let label = it.name;
                        let sublabel = undefined;
                        
                        return (
                          <ListItem key={key} 
                            role="listitem" 
                            button 
                            className={classes.row}
                            onClick={(event) => {
                              handleRowClicked(event, it);
                            }}
                          >
                            <Grid container justify='center' alignItems='center'>
                              <Grid item xs={12}>
                                <Grid container justify='center' alignItems='center' wrap='nowrap'>
                                  
                                  {/* InternalId */}
                                  <Grid item>
                                    <Typography className={classes.id} variant="caption" display="block" noWrap={true}>{it.contactDbId}</Typography>
                                  </Grid>

                                  {/* Divider */}
                                  <Grid item>
                                    <Divider className={classes.dividerV} orientation="vertical" />
                                  </Grid>

                                  <Grid item xs={8}>
                                    {/* Label */}
                                    {(label !== undefined && label !== null) && (
                                      <Typography variant="body1" display="block" noWrap={true}>{label}</Typography>
                                    )}
                                    
                                    {/* Sublabel */}
                                    {(sublabel !== undefined && sublabel !== null) && (
                                      <Typography variant="caption" display="block" color='textSecondary' noWrap={true}>{sublabel}<b></b> </Typography>
                                    )}
                                  </Grid>

                                  {/* Button: Add */}
                                  <Grid item xs={2}>
                                    <Grid container justify='flex-end'>
                                      <Grid item>
                                        <Tooltip title={ t('modelPanels.transferToAdd') }>
                                          <IconButton
                                            color="primary"
                                            className={classes.iconButton}
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              handleAddItem(event, it);
                                            }}
                                          >
                                            <Add htmlColor="#4CAF50" />
                                          </IconButton>
                                        </Tooltip>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>
                          </ListItem>
                        );
                      })}
                      <ListItem />
                    </List>
                  </Box>
                </Fade>
              )}
              {/* Case: loading */}
              {(isOnApiRequest) && (
                /* Progress */
                <Fade
                  in={true}
                  unmountOnExit
                >
                  <div>
                    <Grid container>
                      <Grid item xs={12}>
                        <Box height={lh}>
                          <Grid container className={classes.loadingBox} justify="center" alignItems="center">
                            <Grid item>
                              <CircularProgress color='primary' disableShrink />
                            </Grid>
                          </Grid>
                        </Box>
                      </Grid>
                    </Grid>
                  </div>
                </Fade>
              )}

              {/* Pagination */}
              <ContactToAddTransferViewCursorPagination
                count={count}
                rowsPerPageOptions={(count <=10) ? [] : (count <=50) ? [5, 10, 25, 50] : [5, 10, 25, 50, 100]}
                rowsPerPage={rowsPerPage}
                labelRowsPerPage = { t('modelPanels.rows') }
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                handleFirstPageButtonClick={handleFirstPageButtonClick}
                handleLastPageButtonClick={handleLastPageButtonClick}
                handleNextButtonClick={handleNextButtonClick}
                handleBackButtonClick={handleBackButtonClick}
                handleChangeRowsPerPage={handleChangeRowsPerPage}
              />
            </Card>
          )}
        </Grid>

        {/*
          * Arrows
          */}
        <Hidden xsDown>
          <Grid item xs={1} >
            <Grid container className={classes.arrowsBox} justify='center'>
              <TransferArrows
                color="primary"
                fontSize="large"
                component={svgProps => {
                  return (
                    <svg {...svgProps}>
                      <defs>
                        <linearGradient id="gradient1">
                          <stop offset="30%" stopColor={(countB&&countB>0) ? "#3F51B5" : blueGrey[200]} />
                          <stop offset="70%" stopColor={(count&&count>0) ? "#4CAF50" : blueGrey[200]} />
                        </linearGradient>
                      </defs>
                      {React.cloneElement(svgProps.children[0], {
                        fill: 'url(#gradient1)',
                      })}
                    </svg>
                  );
                }}
              />
            </Grid>
          </Grid>
        </Hidden>
        <Hidden smUp>
          <Grid item xs={1} >
            <Grid container className={classes.arrowsBox} justify='center'>
              <TransferArrows
                className={classes.arrowsV}
                color="primary"
                fontSize="large"
                component={svgProps => {
                  return (
                    <svg {...svgProps}>
                      <defs>
                        <linearGradient id="gradient1b">
                          <stop offset="30%" stopColor={(countB&&countB>0) ? "#3F51B5" : blueGrey[200]} />
                          <stop offset="70%" stopColor={(count&&count>0) ? "#4CAF50" : blueGrey[200]} />
                        </linearGradient>
                      </defs>
                      {React.cloneElement(svgProps.children[0], {
                        fill: 'url(#gradient1b)',
                      })}
                    </svg>
                  );
                }}
              />
            </Grid>
          </Grid>
        </Hidden>

        {/*
          * To add list (B) 
          */}
        <Grid item xs={12} sm={5} >
          {(item!==undefined) && (
            <Card className={classes.card}>

              {/* Toolbar */}
              <ContactToAddTransferViewToolbar 
                title={'Contact'}
                titleIcon={2}
                search={searchB}
                searchDisabled={true}
                onSearchEnter={handleSearchEnterB}
                onReloadClick={handleReloadClickB}
              />

              {/* Case: no items added */}
              {(!thereAreItemsToAdd) && (
                /* Label */
                <Fade
                  in={true}
                  unmountOnExit
                >
                  <div>
                    <Grid container>
                      <Grid item xs={12}>
                        <Grid className={classes.noDataBox} container justify="center" alignItems="center">
                          <Grid item>
                            <Typography variant="body2" >{ t('modelPanels.noItemsToAdd', 'No records marked for association') }</Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </div>
                </Fade>
              )}

              {/* Case: no data from search */}
              {(thereAreItemsToAdd && !isOnApiRequestB && (!areItemsReadyB || !isCountReadyB)) && (
                /* Label */
                <Fade
                  in={true}
                  unmountOnExit
                >
                  <div>
                    <Grid container>
                      <Grid item xs={12}>
                        <Grid className={classes.noDataBox} container justify="center" alignItems="center">
                          <Grid item>
                            <Typography variant="body2" >{ t('modelPanels.noData') }</Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </div>
                </Fade>
              )}

              {/* Case: data ready */}
              {(thereAreItemsToAdd && !isOnApiRequestB && areItemsReadyB && isCountReadyB) && (
              
                /* List */
                <Fade
                  in={true}
                  unmountOnExit
                >
                  <Box className={classes.listBox} ref={lrefB}>
                    <List dense component="div" role="list">
                      {itemsB.map(it => {
                        let key = it.contactDbId;
                        let label = it.name;
                        let sublabel = undefined;
                        
                        return (
                          <ListItem key={key} 
                            role="listitem"
                            button
                            className={classes.row}
                            onClick={(event) => {
                              handleRowClicked(event, it);
                            }}
                          >
                            <Grid container justify='flex-end' alignItems='center'>
                              <Grid item xs={12}>
                                <Grid container justify='space-evenly' alignItems='center' alignContent='stretch' wrap='nowrap'>
                                  
                                  {/* InternalId */}
                                  <Grid item>
                                    <Typography className={classes.id} variant="caption" display="block" noWrap={true}>{it.contactDbId}</Typography>
                                  </Grid>

                                  {/* Divider */}
                                  <Grid item>
                                    <Divider className={classes.dividerV} orientation="vertical" />
                                  </Grid>

                                  <Grid item xs={8}>

                                    {/* Label */}
                                    {(label !== undefined && label !== null) && (
                                      <Typography variant="body1" display="block" noWrap={true}>{label}</Typography>
                                    )}
                                    
                                    {/* Sublabel */}
                                    {(sublabel !== undefined && sublabel !== null) && (
                                      <Typography variant="caption" display="block" color='textSecondary' noWrap={true}>{sublabel}<b></b> </Typography>
                                    )}
                                  </Grid>

                                  {/* Button: Add */}
                                  <Grid item xs={2}>
                                    <Tooltip title={ t('modelPanels.untransferToAdd') }>
                                      <IconButton
                                        color="primary"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          handleRemoveItem(event, it);
                                        }}
                                      >
                                        <Remove color="primary" />
                                      </IconButton>
                                    </Tooltip>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>
                          </ListItem>
                        );
                      })}
                      <ListItem />
                    </List>
                  </Box>
                </Fade>
              )}
              {/* Case: loading */}
              {( thereAreItemsToAdd && isOnApiRequestB) && (
                /* Progress */
                <Fade
                  in={true}
                  unmountOnExit
                >
                  <div>
                    <Grid container>
                      <Grid item xs={12}>
                        <Box height={lhB}>
                          <Grid container className={classes.loadingBox} justify="center" alignItems="center">
                            <Grid item>
                              <CircularProgress color='primary' disableShrink />
                            </Grid>
                          </Grid>
                        </Box>
                      </Grid>
                    </Grid>
                  </div>
                </Fade>
              )}

              {/* Pagination */}
              {(false) && (
                
                <ContactToAddTransferViewCursorPagination
                  count={countB}
                  rowsPerPageOptions={(countB <=10) ? [] : (count <=50) ? [5, 10, 25, 50] : [5, 10, 25, 50, 100]}
                  rowsPerPage={rowsPerPageB}
                  labelRowsPerPage = { t('modelPanels.rows') }
                  hasNextPage={hasNextPageB}
                  hasPreviousPage={hasPreviousPageB}
                  handleFirstPageButtonClick={handleFirstPageButtonClickB}
                  handleLastPageButtonClick={handleLastPageButtonClickB}
                  handleNextButtonClick={handleNextButtonClickB}
                  handleBackButtonClick={handleBackButtonClickB}
                  handleChangeRowsPerPage={handleChangeRowsPerPageB}
                />
              )}
            </Card>
          )}
        </Grid>
      </Grid>
    </div>
  );
}
ContactToAddTransferView.propTypes = {
  item: PropTypes.object.isRequired,
  idsToAdd: PropTypes.array.isRequired,
  handleTransfer: PropTypes.func.isRequired,
  handleUntransfer: PropTypes.func.isRequired,
  handleClickOnContactRow: PropTypes.func.isRequired,
};