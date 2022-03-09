import PropTypes from 'prop-types';
import React from 'react';
import { map, debounceTime, debounce, switchMap } from 'rxjs/operators';
import { searchOrgClientUsers$ } from 'services/userService';
import { UserSelect } from './UserSelect';
import { BehaviorSubject, Subject, timer } from 'rxjs';

export const ClientSelect = React.memo((props) => {
  const { value, valueProp, onChange, allowInput } = props;
  const [dataSource, setDataSource] = React.useState([]);
  const source$ = React.useRef(new BehaviorSubject(''));

  React.useEffect(() => {
    let firstLoad = true;

    const sub$ = source$.current.pipe(
      debounce(() => {
        const span = firstLoad ? 0 : 500;
        firstLoad = false;
        return timer(span);
      }),
      switchMap((text) => searchOrgClientUsers$({ size: 2, text })),
      map(resp => resp.data),
    ).subscribe(setDataSource);

    return () => sub$.unsubscribe();
  }, [])

  const handleTextChange = text => {
    source$.current.next(text);
  }

  return <UserSelect
    value={value}
    dataSource={dataSource}
    allowInput={allowInput}
    valueProp={valueProp}
    onChange={onChange}
    onTextChange={handleTextChange}
    placeholder={allowInput ? 'Search a client by name or email or input a new email address' : 'Select a client by name or email'}
  />
});

ClientSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  valueProp: PropTypes.oneOf(['id', 'email']),
  allowInput: PropTypes.bool,
};

ClientSelect.defaultProps = {
  valueProp: 'id',
  allowInput: true,
};

