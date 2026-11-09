import { Link } from 'react-router-dom';
import { Panel } from '../components/Panel/Panel';
import { StatusLabel } from '../components/StatusLabel/StatusLabel';
import { STATUS_KIND, TABLE_TOTALS_CHECKED_LABEL } from '../data/status';
import { PageHeader } from '../layout/PageHeader/PageHeader';
import styles from './MethodologyPage.module.css';

export function MethodologyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Evidence"
        title="Methodology"
        description="Where SafeHer's figures come from, how they are checked, and what they cannot show. Position as of November 2026."
      />
      <div className={styles.sections}>
        <Panel title="Where the annual figures come from">
          <div className={styles.body}>
            <p>
              The Overview shows crimes against women registered in Delhi UT, from Table 3A.1 of the
              National Crime Records Bureau&apos;s <cite>Crime in India</cite>. Figures for 2016–2018
              come from the 2018 edition, 2020–2021 from the 2022 edition, and 2022–2024 from the
              2024 edition.
            </p>
            <p>
              Each number is stored exactly as printed. These are registered cases. They are not
              victim counts, and they do not measure how often crime occurs. Only the most serious
              offence in each case is counted, and under-reporting is unknown. NCRB cautions that
              more registered crime does not indicate a place is comparatively unsafe.
            </p>
          </div>
        </Panel>

        <Panel title="What the reporting unit means">
          <div className={styles.body}>
            <p>
              A reporting unit is the area NCRB publishes a figure for. These figures describe Delhi
              UT as a whole. The tables print the unit as &ldquo;Delhi UT&rdquo; or
              &ldquo;Delhi&rdquo; depending on the year, and SafeHer keeps the original label.
            </p>
            <p>
              Delhi City is a separate unit in NCRB&apos;s metropolitan tables and is never combined
              with this series. The two totals are identical for 2024. The reason is unexplained, so
              the units should not be assumed to be equivalent.
            </p>
          </div>
        </Panel>

        <Panel title="How evidence and validation status are handled">
          <div className={styles.body}>
            <p>
              Each annual figure and its geography label were compared with a one-page NCRB table
              extract, and the file&apos;s SHA-256 hash is recorded. The status shown beside a figure
              comes from its stored validation record.
            </p>
            <ul className={styles.statuses}>
              <li>
                <StatusLabel kind={STATUS_KIND.VERIFIED} />
                <span>Reserved for records with every applicable check complete.</span>
              </li>
              <li>
                <StatusLabel kind={STATUS_KIND.VERIFIED_WITH_NOTE}>{TABLE_TOTALS_CHECKED_LABEL}</StatusLabel>
                <span>
                  The current status of all eight annual totals. The extract check passed. The
                  comparison with the category table (TOT-4) is still pending.
                </span>
              </li>
              <li>
                <StatusLabel kind={STATUS_KIND.INCOMPLETE} />
                <span>The source exists but checks are unfinished, disputed or failed.</span>
              </li>
              <li>
                <StatusLabel kind={STATUS_KIND.UNAVAILABLE} />
                <span>No value from an obtained source, or a status that cannot be confirmed.</span>
              </li>
            </ul>
          </div>
        </Panel>

        <Panel title="Why 2019 is missing">
          <div className={styles.body}>
            <p>
              The English <cite>Crime in India 2021</cite> edition, the expected source for the 2019
              total, has not been obtained. The chart leaves a gap at 2019. Nothing is estimated,
              interpolated or shown as zero.
            </p>
          </div>
        </Panel>

        <Panel title="Why Table 3A.2 is not in production">
          <div className={styles.body}>
            <p>
              Table 3A.2 breaks totals into offence categories. Delhi rows for 2018 and 2022–2024
              have been extracted for research, but extracting a table does not approve it for
              publication.
            </p>
            <p>
              NCRB&apos;s printed kidnapping formula raises an unresolved question, comparability
              between IPC and BNS categories has not been assessed, and sources for other years have
              not been obtained. No category figures are shown until this review is complete.
            </p>
          </div>
        </Panel>

        <Panel title="Why the Geographic Explorer shows no crime values">
          <div className={styles.body}>
            <p>
              The <Link to="/geographic-explorer">Geographic Explorer</Link> draws one OpenStreetMap
              outline for context. That outline has not been shown to match NCRB&apos;s Delhi UT or
              Delhi City reporting units, so NCRB counts are not placed on it.
            </p>
          </div>
        </Panel>

        <Panel title="Why district-level conclusions cannot be made">
          <div className={styles.body}>
            <p>
              The NCRB tables in use are Delhi-wide, and dividing a Delhi-wide total among districts,
              wards, police stations or streets would invent figures. Official district tables have
              not been retrieved and validated, and permission to use police-district boundaries has
              not been established.
            </p>
            <p>
              SafeHer therefore makes no district-level risk or safety claims and calculates no
              safety score. A count of registered cases is not the probability that a person will
              experience a crime.
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}
