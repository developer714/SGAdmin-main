// third-party
import { merge } from "lodash";

// project import
import Accordion from "./Accordion";
import AccordionDetails from "./AccordionDetails";
import Alert from "./Alert";
// import AlertTitle from "./AlertTitle";
import Autocomplete from "./Autocomplete";
import Badge from "./Badge";
import Button from "./Button";
import ButtonBase from "./ButtonBase";
import ButtonGroup from "./ButtonGroup";
import CardContent from "./CardContent";
import Chip from "./Chip";
import Dialog from "./Dialog";
import DialogContentText from "./DialogContentText";
import DialogTitle from "./DialogTitle";
import Divider from "./Divider";
import Fab from "./Fab";
import FormControlLabel from "./FormControlLabel";
// import IconButton from "./IconButton";
// import InputBase from "./InputBase";
import InputLabel from "./InputLabel";
import LinearProgress from "./LinearProgress";
import Link from "./Link";
import ListItemButton from "./ListItemButton";
import ListItemIcon from "./ListItemIcon";
import LoadingButton from "./LoadingButton";
import MenuItem from "./MenuItem";
import OutlinedInput from "./OutlinedInput";
import Pagination from "./Pagination";
import PaginationItem from "./PaginationItem";
import Popover from "./Popover";
import Radio from "./Radio";
import Select from "./Select";
import Slider from "./Slider";
import Switch from "./Switch";
import Tab from "./Tab";
import Table from "./Table";
import TableBody from "./TableBody";
import TableCell from "./TableCell";
import TableFooter from "./TableFooter";
import TableHead from "./TableHead";
import TablePagination from "./TablePagination";
import TableRow from "./TableRow";
import Tabs from "./Tabs";
import ToggleButton from "./ToggleButton";
import Tooltip from "./Tooltip";
import TreeItem from "./TreeItem";
import Typography from "./Typography";
import AccordionSummary from "./AccordionSummary";

// ==============================|| OVERRIDES - MAIN ||============================== //

export default function ComponentsOverrides(theme) {
  return merge(
    Accordion(theme),
    AccordionDetails(theme),
    AccordionSummary(theme),
    Alert(theme),
    // AlertTitle(theme),
    Autocomplete(theme),
    Badge(theme),
    Button(theme),
    ButtonBase(),
    ButtonGroup(),
    CardContent(),
    Chip(theme),
    Dialog(),
    DialogContentText(theme),
    DialogTitle(),
    Divider(theme),
    Fab(theme),
    FormControlLabel(theme),
    // IconButton(theme),
    // InputBase(theme),
    InputLabel(theme),
    LinearProgress(theme),
    Link(),
    ListItemButton(theme),
    ListItemIcon(theme),
    LoadingButton(theme),
    MenuItem(theme),
    OutlinedInput(theme),
    Pagination(),
    PaginationItem(theme),
    Popover(theme),
    Radio(theme),
    Select(theme),
    Slider(theme),
    Switch(theme),
    Tab(theme),
    Table(),
    TableBody(theme),
    TableCell(theme),
    TableFooter(),
    TableHead(theme),
    TablePagination(theme),
    TableRow(),
    Tabs(theme),
    ToggleButton(theme),
    Tooltip(theme),
    TreeItem(),
    Typography(theme)
  );
}
