import mapStyles from './MapExplorer.module.css';

const GROUPS = [
  { id: 'all', title: 'All crimes against women', test: (c) => c.key === 'total' },
  { id: 'ipc', title: 'Indian Penal Code (IPC) headings', test: (c) => c.key !== 'total' && c.legalRegime === 'IPC' },
  { id: 'sll', title: 'Special and local laws (SLL)', test: (c) => c.key !== 'total' && c.legalRegime === 'SLL' },
];

const years = (c) => (c.years.length === 1 ? `${c.years[0]} only` : `${c.years[0]}–${c.years[c.years.length - 1]}`);

// Only categories that passed the district validation checks are offered. Labels are NCRB's.
export function CategoryPanel({ categories, value, onChange }) {
  if (!categories) return <p className={mapStyles.hint}>Loading categories…</p>;
  return (
    <div className={mapStyles.panelBody}>
      <fieldset className={mapStyles.fieldset}>
        <legend className={mapStyles.visuallyHidden}>Crime category shown on the map</legend>
        {GROUPS.map((group) => {
          const items = categories.filter(group.test);
          if (items.length === 0) return null;
          return (
            <div key={group.id} className={mapStyles.categoryGroup} role="group" aria-labelledby={`cat-${group.id}`}>
              <h3 id={`cat-${group.id}`} className={mapStyles.groupTitle}>{group.title}</h3>
              {items.map((c) => (
                <label key={c.key} className={mapStyles.option}>
                  <input type="radio" name="district-category" value={c.key} checked={value === c.key} onChange={() => onChange(c.key)} />
                  <span>
                    <span>{c.label}</span>
                    <span className={mapStyles.hint}>{years(c)}</span>
                  </span>
                </label>
              ))}
            </div>
          );
        })}
      </fieldset>
      <section className={mapStyles.categoryGroup} aria-labelledby="cat-notes">
        <h3 id="cat-notes" className={mapStyles.groupTitle}>Why some categories are not offered</h3>
        <ul className={mapStyles.availability}>
          <li>Categories overlap and are not added together. Only NCRB&apos;s printed total is a total.</li>
          <li>Category figures are offered for 2022 only: the 2020 and 2021 district category columns have not been checked against a state table.</li>
          <li>Kidnapping &amp; Abduction of Women is left out while a question about NCRB&apos;s printed formula is open.</li>
          <li>Age sub-groups (women and girls) are parts of their headings and are not shown separately.</li>
          <li>No district figures are published for the BNS years (2024), so IPC and BNS headings are never mixed.</li>
        </ul>
      </section>
    </div>
  );
}
