import {
  initializeBlock,
  useBase,
  useRecords,
  createRecordAsync,
  table,
  FormField,
  Input,
  Select,
  useSession,
  Button,
  Switch,
  Text,
  Box,
} from "@airtable/blocks/ui";
import { FieldType } from "@airtable/blocks/models";
import { base } from "@airtable/blocks";
import React, { useState, useEffect } from "react";

const TableSelectField = (props) => {
  const options =
    props.tables &&
    props.tables.map((x) => ({
      value: x.id,
      label: x.name,
    }));
  const [value, setValue] = useState(null);

  useEffect(() => {
    props.onValueChange && props.onValueChange(value);
  }, [value]);

  return (
    <FormField label="Table Name">
      <Select
        options={options}
        value={value || options[0]}
        onChange={(newValue) => setValue(newValue)}
      />
    </FormField>
  );
};

const Field = (props) => {
  const [value, setValue] = useState(props.initialValue);

  useEffect(() => {
    props.onValueChange && props.onValueChange(value);
  }, [value]);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  return (
    <FormField label={props.label}>
      <Input
        disabled={props.disabled}
        value={value && value.toString()}
        onChange={(e) => setValue(e.target.value)}
      />
    </FormField>
  );
};

function Seeding() {
  const base = useBase();
  const session = useSession();

  const [state, setState] = useState({
    tableName: null,
    tableId: null,
    numberOfRecordsToGenerate: 1000,
    table: null,
    willConfirm: false,
    seeded: 0,
    seeding: false,
  });

  useEffect(() => {
    if (!state.tableId) return;
    let table = base.getTableById(state.tableId);
    setState({ ...state, table });
  }, [state.tableId]);

  useEffect(() => {
    if (!window) return;
    window.addEventListener("seeded", () => {
      setState({ ...state, seeded: state.seeded + 1, seeding: true });
    });
    window.addEventListener("seeding-stopped", () => {
      setState({ ...state, seeded: 0, seeding: false });
    });
  }, [window]);

  return (
    <div style={styles.root}>
      <TableSelectField
        tables={base.tables}
        onValueChange={(tableId) => {
          setState({ ...state, tableId });
        }}
      />
      <Field
        initialValue="No table selected"
        value={state.tableId}
        label="Table Identifier"
        disabled
      />
      <Field
        initialValue="No table selected"
        value={state.numberOfRecordsToGenerate}
        label="Number of elements to generate"
        onValueChange={(e) => {
          setState({
            ...state,
            numberOfRecordsToGenerate: e ? parseInt(e) || 1000 : 0,
          });
        }}
      />
      {state.seeding && (
        <Button
          variant={"danger"}
          onClick={() => {
            setState({ ...state, willConfirm: false, seeding: false });
            seedingIndex = Infinity;
          }}
        >
          Stop Seeding
        </Button>
      )}
      {!state.seeding && (
        <Button
          variant={state.willConfirm ? "danger" : "primary"}
          onClick={() => {
            if (state.willConfirm) {
              seed(state.table, {
                ...state,
                currentUserId: session.currentUser.id,
              });
            } else {
              setState({ ...state, willConfirm: true });
            }
          }}
        >
          {state.willConfirm
            ? "Yes, Confirm record creation"
            : "Generate Records"}
        </Button>
      )}
      {state.seeding && (
        <Box
          backgroundColor="white"
          borderRadius="none"
          paddingY={2}
          centered
          overflow="hidden"
        >
          <Text as="small">Generating Records...</Text>
        </Box>
      )}
    </div>
  );
}

function generateRandomEmail() {
  const randomString = Math.random().toString(36).substring(2, 15);
  const domain = "example.com"; // You can customize the domain
  return `${randomString}@${domain}`;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhoneNumber() {
  let phoneNumber = "";

  // Generate the area code (3 digits)
  for (let i = 0; i < 3; i++) {
    phoneNumber += Math.floor(Math.random() * 10);
  }

  // Generate the next 3 digits
  for (let i = 0; i < 3; i++) {
    phoneNumber += Math.floor(Math.random() * 10);
  }

  // Generate the last 4 digits
  for (let i = 0; i < 4; i++) {
    phoneNumber += Math.floor(Math.random() * 10);
  }

  return phoneNumber;
}

function seed(table, opts) {
  let seedingIndex = 0;
  const fields = table.fields;
  const canCreateRecords =
    table.checkPermissionsForCreateRecord().hasPermission;

  if (!canCreateRecords) return;

  let records = [];
  window.requestAnimationFrame(() =>
    createRecord(table, fields, opts, records, seedingIndex)
  );
}

function createRecord(table, fields, opts, records, passedSeedingIndex) {
  let record = {};
  let seedingIndex = passedSeedingIndex;
  fields.forEach((field) => {
    switch (field.type) {
      case FieldType.AI_TEXT:
      case FieldType.AUTO_NUMBER:
      case FieldType.BUTTON:
      case FieldType.BARCODE:
      case FieldType.COUNT:
      case FieldType.CREATED_BY:
      case FieldType.CREATED_TIME:
      case FieldType.EXTERNAL_SYNC_SOURCE:
      case FieldType.FORMULA:
      case FieldType.LAST_MODIFIED_TIME:
      case FieldType.LAST_MODIFIED_BY:
      case FieldType.MULTIPLE_LOOKUP_VALUES:
      case FieldType.ROLLUP:
        // Unable to write to this field type
        break;

      case FieldType.CHECKBOX:
        record[field.id] = Math.random() < 0.5;
        break;

      case FieldType.DATE:
      case FieldType.DATE_TIME:
        let start = new Date(2012, 0, 1);
        let end = new Date(2050, 0, 1);
        let date = new Date(
          start.getTime() + Math.random() * (end.getTime() - start.getTime())
        );
        record[field.id] = date;
        break;

      case FieldType.EMAIL:
        record[field.id] = generateRandomEmail();
        break;

      case FieldType.MULTILINE_TEXT:
      case FieldType.RICH_TEXT:
        record[field.id] = `
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis auctor, ipsum nec iaculis accumsan, tellus neque rutrum lorem, a rhoncus neque justo consectetur turpis. Quisque pellentesque dignissim sagittis. Praesent ut vestibulum est, sit amet ultricies ante. Maecenas pellentesque sollicitudin ipsum, id gravida urna sagittis in. Integer blandit urna quis justo maximus pulvinar. Vestibulum et condimentum arcu. Fusce erat elit, rhoncus ut porttitor sed, euismod vitae massa. In non commodo turpis.

              Duis sed nibh pellentesque, ultrices sem non, commodo dolor. Aenean vestibulum quam ut mi facilisis, et tempus leo porta. Maecenas eu turpis lacus. Duis ullamcorper ornare turpis, et dignissim neque auctor vel. Aliquam facilisis enim ac odio euismod fermentum. Morbi ut justo a magna consequat vestibulum et vel mauris. Morbi quis posuere justo. Sed tincidunt luctus risus id dapibus. Quisque quis ipsum ligula. Pellentesque facilisis, felis et facilisis pellentesque, orci nunc ultrices leo, vel eleifend nulla augue quis nibh. Sed enim diam, interdum in justo non, fermentum vehicula nulla. In vitae velit mi.
          `
          .split(" ")
          .sort(() => (Math.random() > 0.5 ? -1 : 1))
          .map((val) => {
            let bold = Math.random() > 0.5 ? -1 : 1;
            if (bold) {
              return "*" + val + "*";
            }
            return val;
          })
          .join(" ");
        break;

      case FieldType.MULTIPLE_ATTACHMENTS:
        record[field.id] = [
          {
            url: "https://images.unsplash.com/photo-1616572496489-d27745ec95e2?q=80&w=3331&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            filename: "easter-egg.jpg",
          },
          {
            url: "https://images.unsplash.com/photo-1616572496489-d27745ec95e2?q=80&w=3331&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            filename: "easter-egg.jpg",
          },
        ];
        break;

      case FieldType.MULTIPLE_COLLABORATORS:
        record[field.id] = [{ id: opts.currentUserId }];
        break;

      case FieldType.MULTIPLE_RECORD_LINKS:
        //record[field.id] = [{id: ""}]
        console.log(field);
        break;

      case FieldType.MULTIPLE_SELECTS:
        record[field.id] =
          field.options &&
          field.options.choices &&
          field.options.choices
            .filter((choice) => (Math.random() < 0.5 ? -1 : 1))
            .map((choice) => ({ id: choice.id }));
        break;

      case FieldType.NUMBER:
      case FieldType.CURRENCY:
      case FieldType.DURATION:
        record[field.id] = Math.round(Math.random()) * (Math.random() * 100);
        break;

      case FieldType.PERCENT:
        record[field.id] = Math.random();
        break;

      case FieldType.PHONE_NUMBER:
        record[field.id] = generatePhoneNumber();
        break;

      case FieldType.RATING:
        record[field.id] = getRandomInt(0, field.max);
        break;

      case FieldType.SINGLE_COLLABORATOR:
        record[field.id] = { id: opts.currentUserId };
        break;

      case FieldType.SINGLE_LINE_TEXT:
        console.log(Math.random());
        record[field.id] =
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
            .split(" ")
            .sort(() => (Math.random() > 0.5 ? -1 : 1))
            .join(" ");
        break;

      case FieldType.SINGLE_SELECT:
        record[field.id] =
          field.options &&
          field.options.choices &&
          field.options.choices.find(() => (Math.random() > 0.5 ? -1 : 1));
        break;

      case FieldType.URL:
        record[field.id] = "https://www.google.com/search?q=airtable";
        break;
    }
  });

  records.push({ fields: record });

  seedingIndex++;
  console.log(seedingIndex);
  const event = new Event("seeded");
  window.dispatchEvent(event);
  console.log(opts.numberOfRecordsToGenerate <= seedingIndex);
  if (
    opts.numberOfRecordsToGenerate <= seedingIndex ||
    seedingIndex % 50 == 0
  ) {
    table.createRecordsAsync(records).then(() => {
      records = [];

      if (opts.numberOfRecordsToGenerate > seedingIndex) {
        console.log(seedingIndex);
        window.requestAnimationFrame(() =>
          createRecord(table, fields, opts, records, seedingIndex)
        );
        return;
      }
      const event = new Event("seeding-stopped");
      window.dispatchEvent(event);
    });
    return;
  }

  console.log(seedingIndex);
  setTimeout(() => {
    window.requestAnimationFrame(() =>
      createRecord(table, fields, opts, records, seedingIndex)
    );
  }, 1);
}

const styles = {
  root: {
    padding: "1rem",
  },
};

initializeBlock(() => <Seeding />);
