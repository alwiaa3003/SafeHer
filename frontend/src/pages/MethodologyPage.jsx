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
              Crime Trends shows crimes against women registered in Delhi UT, from Table 3A.1 of the
              National Crime Records Bureau&apos;s <cite>Crime in India</cite>. Figures for 2016–2018
              come from the 2018 edition, 2020–2021 from the 2022 edition, and 2022–2024 from the
              2024 edition. The 2019 figure comes from an official NCRB spreadsheet.
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
              extract or, for 2019, the official NCRB spreadsheet, and each file&apos;s SHA-256 hash is
              recorded. The status shown beside a figure comes from its stored validation record.
            </p>
            <ul className={styles.statuses}>
              <li>
                <StatusLabel kind={STATUS_KIND.VERIFIED} />
                <span>Reserved for records with every applicable check complete.</span>
              </li>
              <li>
                <StatusLabel kind={STATUS_KIND.VERIFIED_WITH_NOTE}>{TABLE_TOTALS_CHECKED_LABEL}</StatusLabel>
                <span>
                  The current status of all nine annual totals. The source check passed. The
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

        <Panel title="How 2019 was sourced">
          <div className={styles.body}>
            <p>
              The 2019 total comes from NCRB&apos;s official spreadsheet of State/UT crimes against
              women for 2014–2019. It reproduces the 2016–2018 figures above exactly. A printed{' '}
              <cite>Crime in India 2021</cite> table was only available as a third-party-hosted
              copy, which agrees.
            </p>
            <p>
              The all-India 2019 total differs between those two sources, and the reason is
              unresolved. The Delhi value is identical in both. The comparison with the category
              table for 2019 is still outstanding. Nothing is estimated or interpolated.
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

        <Panel title="The police-district crime map">
          <div className={styles.body}>
            <p>
              The <Link to="/">Crime Map</Link> shades Delhi&apos;s police districts by the number of
              crimes against women registered by police, as printed in NCRB&apos;s{' '}
              <em>District-wise Crime against Women</em> spreadsheets for 2020, 2021 and 2022
              (worksheet &ldquo;District Data Report&rdquo;, Delhi section). Each figure links to its
              file, row and column.
            </p>
            <ul>
              <li><strong>Unit:</strong> the 16 geographic police districts. Seven police units with no territory (Crime Branch, EOW, Metro, RAILWAY, SPUWAC, Spl Cell and Vigilance) are listed separately and never drawn as areas.</li>
              <li><strong>Registered cases:</strong> cases registered by police in the year. The files print no incidence or victims label; their totals equal the Delhi registered-case totals in Table 3A.1, so they are treated as registered cases.</li>
              <li><strong>Checks:</strong> for each year the 23 units sum exactly to the printed district total and to the Delhi UT total. For 2022, each offered category&apos;s Delhi sum equals Table 3A.2.</li>
              <li><strong>Categories:</strong> the overall total for 2020–2022, and 20 NCRB headings for 2022 only, with NCRB&apos;s labels. Age sub-groups, the Kidnapping &amp; Abduction group (an open formula question) and the unchecked 2020–2021 category columns are not offered. Categories overlap and are never added together. All years are IPC-era, so IPC and BNS headings are never mixed.</li>
              <li><strong>Missing data:</strong> a district or year without a validated figure is grey and labelled &ldquo;Not available&rdquo;. It is never shown as zero, estimated, or filled from another year or area. A printed zero is shown as zero.</li>
              <li><strong>Colours:</strong> one hue, light terracotta to dark red, in classes built from the selected year and category only. Darker means more registered cases, not higher individual risk.</li>
              <li><strong>Change:</strong> compared with the latest earlier validated year. A percentage is shown only when the earlier figure is above zero.</li>
              <li><strong>Last verified:</strong> 10 November 2026.</li>
            </ul>
            <p>
              <strong>Boundaries.</strong> No openly licensed police-district boundary has been found.
              GeoSpatial Delhi Limited publishes the 16 polygons but states &ldquo;All Rights
              Reserved&rdquo;, so SafeHer does not publish them. Until written permission is given,
              the figures are available as a table and the map draws no district shapes.
            </p>
            <p>
              <strong>Reuse.</strong> No open licence covers NCRB&apos;s district-wise files. NCRB&apos;s
              website copyright statement says its material may be downloaded but should not be
              reproduced, in part or in full, without the Bureau&apos;s prior permission, and must not
              be used in a misleading context. SafeHer has asked for no such permission yet, so this
              question is open. The figures cite the National Crime Records Bureau, and NCRB&apos;s
              files are not redistributed.
            </p>
          </div>
        </Panel>

        <Panel title="What district figures cannot tell you">
          <div className={styles.body}>
            <p>Registered cases, not proven offences. District-level statistics do not identify individual incident locations. Not a safety score.</p>
            <p>
              A district figure covers the whole district. It does not describe any street,
              neighbourhood or place within it, and it is never divided among wards, police stations
              or localities. Registered cases depend on reporting and registration as well as on
              offending, so fewer registered cases do not necessarily mean an area is safer.
            </p>
            <p>
              SafeHer calculates no safety score and does not rank districts. A count of registered
              cases is not the probability that a person will experience a crime.
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}
