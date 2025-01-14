import TableDelegate from "sap/ui/mdc/TableDelegate";
import Text from "sap/m/Text";
import Element from "sap/ui/core/Element";
import JSONPropertyInfo from "mdc/tutorial/model/metadata/JSONPropertyInfo";
import type {
	default as Table,
	PropertyInfo as TablePropertyInfo,
} from "sap/ui/mdc/Table";
import Column from "sap/ui/mdc/table/Column";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import type FilterBar from "sap/ui/mdc/FilterBar";
import JSONBaseDelegate from "./JSONBaseDelegate";

interface TablePayload {
	bindingPath: string;
	searchKeys: string[];
}

const _createColumn = (propertyInfo: TablePropertyInfo, table: Table) => {
	const name = propertyInfo.key;
	const id = `${table.getId()}---col-${name}`;
	const column = Element.getElementById(id) as Column;
	return (
		column ??
		new Column(id, {
			propertyKey: name,
			header: propertyInfo.label,
			template: new Text({
				text: {
					path: `mountains>${name}`,
					type: propertyInfo.dataType,
				},
			}),
		})
	);
};

const _createSearchFilters = (search: string, keys: string[]) => {
	const filters = keys.map(
		(key) =>
			new Filter({
				path: key,
				operator: FilterOperator.Contains,
				value1: search,
			}),
	);
	return [new Filter(filters, false)];
};

const JSONTableDelegate = Object.assign({}, TableDelegate, JSONBaseDelegate);

/**
 * Returns the metadata, excluding the special $search prop.
 */
JSONTableDelegate.fetchProperties = async () => {
	return JSONPropertyInfo.filter((p) => p.key !== "$search");
};

/**
 * Used in the customizing for example, where you may add more columns to the view.
 */
JSONTableDelegate.addItem = async (table: Table, propertyKey: string) => {
	const propertyInfo = JSONPropertyInfo.find((p) => p.key === propertyKey);
	return _createColumn(propertyInfo, table);
};

JSONTableDelegate.getFilters = (table) => {
	const search = (
		Element.getElementById(table.getFilter()) as FilterBar
	).getSearch();
	const keys = (table.getPayload() as TablePayload).searchKeys;
	let filters = TableDelegate.getFilters(table);
	if (search && keys) {
		filters = filters.concat(_createSearchFilters(search, keys));
	}
	return filters;
};

/**
 * Forwards binding to the underlying control.
 */
JSONTableDelegate.updateBindingInfo = (table, bindingInfo) => {
	TableDelegate.updateBindingInfo.call(JSONTableDelegate, table, bindingInfo);
	bindingInfo.path = (table.getPayload() as TablePayload).bindingPath;
	bindingInfo.templateShareable = true;
};

export default JSONTableDelegate;
