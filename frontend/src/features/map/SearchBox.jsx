import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { searchPlaces } from '../../data';
import { matchDistricts } from '../districts/districtScale';
import styles from './MapExplorer.module.css';

// Search runs only when the user submits: the Nominatim policy does not allow autocomplete.
// A query that names a police district exactly also offers that district, from SafeHer's list.
export function SearchBox({ onChoose, districts = [], onChooseDistrict }) {
  const [query, setQuery] = useState('');
  const [state, setState] = useState({ status: 'idle', results: [], query: '' });
  const [districtMatches, setDistrictMatches] = useState([]);

  async function submit(event) {
    event.preventDefault();
    const q = query.trim();
    if (q.length < 2) {
      setState({ status: 'invalid', results: [], query: q });
      setDistrictMatches([]);
      return;
    }
    setDistrictMatches(onChooseDistrict ? matchDistricts(q, districts) : []);
    // The same search is not sent twice in a row.
    if (q === state.query && state.status === 'ready') return;
    setState({ status: 'loading', results: [], query: q });
    try {
      const body = await searchPlaces(q);
      setState({ status: body.data.length ? 'ready' : 'empty', results: body.data, query: q });
    } catch {
      setState({ status: 'error', results: [], query: q });
    }
  }

  function choose(result) {
    onChoose(result);
    setState({ status: 'idle', results: [], query: '' });
  }

  function chooseDistrict(code) {
    onChooseDistrict(code);
    setDistrictMatches([]);
    setState({ status: 'idle', results: [], query: '' });
  }

  function clear() {
    setQuery('');
    setDistrictMatches([]);
    setState({ status: 'idle', results: [], query: '' });
  }

  return (
    <div className={styles.search}>
      <form role="search" aria-label="Search places in Delhi" onSubmit={submit} className={styles.searchForm}>
        <label htmlFor="place-search" className={styles.visuallyHidden}>Search places in Delhi</label>
        <Search size={18} aria-hidden="true" className={styles.searchIcon} />
        <input
          id="place-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a neighbourhood, road or landmark"
          autoComplete="off"
          maxLength={120}
          className={styles.searchInput}
        />
        {query && (
          <button type="button" className={styles.iconButton} onClick={clear} aria-label="Clear search">
            <X size={16} aria-hidden="true" />
          </button>
        )}
        <button type="submit" className={styles.searchButton} disabled={state.status === 'loading'}>Search</button>
      </form>
      <div aria-live="polite">
        {districtMatches.length > 0 && (
          <ul className={styles.results} aria-label="Police districts">
            {districtMatches.map((d) => (
              <li key={d.code}>
                <button type="button" className={styles.result} onClick={() => chooseDistrict(d.code)}>
                  <span className={styles.resultName}>{d.label}</span>
                  <span className={styles.resultLabel}>Police district · NCRB figures</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {state.status === 'loading' && <p className={styles.searchNote}>Searching…</p>}
        {state.status === 'invalid' && <p className={styles.searchNote}>Enter at least two characters.</p>}
        {state.status === 'empty' && <p className={styles.searchNote}>No places found in Delhi for &ldquo;{state.query}&rdquo;.</p>}
        {state.status === 'error' && <p className={styles.searchNote} role="alert">Place search is unavailable right now. The map still works.</p>}
        {state.status === 'ready' && (
          <ul className={styles.results} aria-label="Search results">
            {state.results.map((r) => (
              <li key={r.id}>
                <button type="button" className={styles.result} onClick={() => choose(r)}>
                  <span className={styles.resultName}>{r.name}</span>
                  <span className={styles.resultLabel}>{r.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className={styles.provider}>
        Search by <a href="https://nominatim.org/" target="_blank" rel="noopener noreferrer">Nominatim</a> · © OpenStreetMap contributors. Search terms are sent to this service.
      </p>
    </div>
  );
}
